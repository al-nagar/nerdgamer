// This is the final, corrected version of our data engine.
// It is simpler, more robust, and fixes all the bugs we found.

import { PrismaClient } from '@prisma/client';
import Fuse from 'fuse.js';

const prisma = new PrismaClient();

// --- TYPE DEFINITIONS ---
// We define the shape of our data for type safety.

interface IgdbToken {
  access_token: string;
  expires_at: number;
}

interface RawgGame {
  id: number;
  name: string;
  released: string; // "2015-05-18"
  platforms: { platform: { id: number, name: string, slug: string } }[];
  developers: { name: string }[];
  stores: { store: { id: number, name: string, slug: string } }[];
  genres?: { id: number, name: string, slug: string }[];
  website?: string;
  clip?: {
    clip: string;
    preview: string;
  };
  esrb_rating?: {
    id: number;
    name: string;
    slug: string;
  };
  age_ratings?: Array<{
    id: number;
    category: number;
    rating: number;
    rating_cover_url?: string;
    title?: string;
    description?: string;
  }>;
  tags?: { id: number; name: string }[];
}

interface IgdbCandidate {
  id: number;
  name: string;
  first_release_date?: number; // Unix timestamp
  platforms?: { name: string }[];
  involved_companies?: { company: { name: string } }[];
}

interface IgdbGame {
  id: number;
  name: string;
  summary?: string;
  first_release_date?: number;
  platforms?: { name: string }[];
  involved_companies?: { company: { id: number; name: string } }[];
  game_modes?: { name: string }[];
  game_engines?: { name: string }[];
  player_perspectives?: { name: string }[];
  age_ratings?: any[];
  themes?: { name: string }[];
  franchises?: { name: string }[];
  genres?: { id: number; name: string; slug: string }[];
  videos?: { name: string; video_id: string }[];
  screenshots?: { url: string }[];
  language_supports?: Array<{
    language: { name: string };
    support_type: { name: string };
  }>;
  alternative_names?: Array<{
    name: string;
    comment: string;
  }>;
  keywords?: { id: number; name: string }[];
}

interface IgdbCompletionTimeField {
  value: number;
  unit: string;
}

interface IgdbCompletionTimes {
  hastily?: IgdbCompletionTimeField;
  normally?: IgdbCompletionTimeField;
  completely?: IgdbCompletionTimeField;
}

export interface UnifiedGameData extends Omit<RawgGame, 'website'> {
  screenshots: Array<{ id: string | number; image: string }>;
  video_data?: {
    source: 'igdb';
    videos: { name: string; video_id: string }[];
  } | {
    source: 'rawg';
    clip: {
      clip: string;
      preview: string;
    };
  };
  website: string | null;
  developers: Array<{ id?: number; name: string }>;
  publishers: Array<{ id?: number; name: string }>;
  genres?: Array<{ id: number; name: string; slug: string }>;
  supported_languages?: Record<string, { audio: boolean; subtitles: boolean; interface: boolean }>;
  alternative_names?: Array<{
    name: string;
    comment: string;
  }>;
  completion_times?: {
    hastily?: { value: number; unit: string };
    normally?: { value: number; unit: string };
    completely?: { value: number; unit: string };
  };
  additions?: Array<{
    id: number;
    name: string;
    slug: string;
    background_image?: string;
    released?: string;
    rating?: number;
    metacritic?: number | null;
  }>;
  game_series?: Array<{
    id: number;
    name: string;
    slug: string;
    background_image?: string;
    released?: string;
    rating?: number;
    metacritic?: number | null;
  }>;
  parent_games?: Array<{
    id: number;
    name: string;
    slug: string;
    background_image?: string;
    released?: string;
    rating?: number;
    metacritic?: number | null;
  }>;
  tags?: Array<{ id: number; name: string; source: string }>;
}

// Remove from UnifiedGameData type
type CleanedUnifiedGameData = Omit<UnifiedGameData, 'added' | 'suggestions_count' | 'reviews_count' | 'achievements_count'>;

// --- API HELPER FUNCTIONS ---
// Each function has one specific job.

let igdbTokenCache: IgdbToken | null = null;

async function getIgdbToken(): Promise<string> {
  if (igdbTokenCache && igdbTokenCache.expires_at > Date.now()) {
    return igdbTokenCache.access_token;
  }

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
  });
  if (!response.ok) throw new Error('Failed to get IGDB token');
  const data = await response.json();
  igdbTokenCache = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in * 1000 - 60000),
  };
  return igdbTokenCache.access_token;
}

// FIX: This function now handles 404 errors gracefully by returning null.
async function fetchFromRawg(gameId: string): Promise<RawgGame | null> {
  const response = await fetch(`https://api.rawg.io/api/games/${gameId}?key=${process.env.NEXT_PUBLIC_RAWG_API_KEY}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch from RAWG API');
  }
  return response.json();
}

async function fetchRawgScreenshots(gameId: string) {
  const response = await fetch(`https://api.rawg.io/api/games/${gameId}/screenshots?key=${process.env.NEXT_PUBLIC_RAWG_API_KEY}`);
  if (!response.ok) return [];
  const data = await response.json();
  return data.results;
}

async function fetchFromIgdb(matchingData: { name: string; slug: string; year: string }): Promise<IgdbCandidate | null> {
  const token = await getIgdbToken();
  const clientId = process.env.IGDB_CLIENT_ID;
  if (!clientId) throw new Error('IGDB Client ID not found');

  // 1. Try exact slug match first
  const slugBody = `
    fields name, first_release_date, platforms.name, involved_companies.company.name;
    where slug = "${matchingData.slug}";
    limit 3;
  `;
  const headers = {
    'Client-ID': clientId,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'text/plain'
  } as const;

  let response = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers,
    body: slugBody,
  });
  if (response.ok) {
    const data = await response.json();
    if (data.length > 0) {
      return data[0];
    }
  }

  // 2. Fallback: Smart match (name + year)
  const body = `
    fields name, first_release_date, platforms.name, involved_companies.company.name;
    where (name ~ "${matchingData.name}" | slug = "${matchingData.slug}") & release_dates.y = ${matchingData.year};
    limit 10;
  `;
  response = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers,
    body: body,
  });
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data.length > 0 ? data[0] : null;
}

async function fetchCompletionTimes(igdbGameId: number): Promise<IgdbCompletionTimes | null> {
  const token = await getIgdbToken();
  const clientId = process.env.IGDB_CLIENT_ID;
  if (!clientId) throw new Error('IGDB Client ID not found');

  const body = `fields *; where game_id = ${igdbGameId}; limit 1;`;
  const headers = {
    'Client-ID': clientId,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'text/plain'
  } as const;

  const response = await fetch('https://api.igdb.com/v4/game_time_to_beats', {
    method: 'POST',
    headers,
    body: body,
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (!data[0]) return null;

  function parseTimeField(field: any) {
    if (!field) return undefined;
    if (typeof field === 'object' && field.amount && field.unit) {
      let value = field.amount;
      let unit = field.unit.toLowerCase();
      if (unit === 's') {
        value = Math.round(value / 3600);
        unit = 'h';
      } else if (unit === 'm') {
        value = Math.round(value / 60);
        unit = 'h';
      }
      return { value, unit };
    }
    // fallback: if value is huge, treat as seconds
    if (typeof field === 'number' && field > 10000) {
      return { value: Math.round(field / 3600), unit: 'h' };
    }
    // fallback: treat as hours
    return { value: field, unit: 'h' };
  }

  return {
    hastily: parseTimeField(data[0].hastily),
    normally: parseTimeField(data[0].normally),
    completely: parseTimeField(data[0].completely),
  };
}

async function fetchIgdbDataByIds(endpoint: string, fields: string, ids: number[]) {
    if (!ids || ids.length === 0) return [];
    const igdbToken = await getIgdbToken();
    let query = `fields id,${fields}; where id = (${ids.join(',')}); limit ${ids.length};`;
    let response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
        method: 'POST',
        headers: {
            'Client-ID': process.env.IGDB_CLIENT_ID!,
            'Authorization': `Bearer ${igdbToken}`,
            'Content-Type': 'text/plain'
        },
        body: query
    });
    if (!response.ok) {
        const errorBody = await response.text();
        // Try a minimal query
        if (fields !== 'id') {
            query = `fields id; where id = (${ids.join(',')}); limit ${ids.length};`;
            response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Client-ID': process.env.IGDB_CLIENT_ID!,
                    'Authorization': `Bearer ${igdbToken}`,
                    'Content-Type': 'text/plain'
                },
                body: query
            });
            if (!response.ok) {
                return [];
            }
        } else {
            return [];
        }
    }
    return response.json();
}

async function fetchFullIgdbData(igdbId: number): Promise<IgdbGame | null> {
  const token = await getIgdbToken();
  const clientId = process.env.IGDB_CLIENT_ID;

  if (!clientId) {
    throw new Error('IGDB client ID not found');
  }

  const headers = {
    'Client-ID': clientId,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'text/plain',
  } as const;

  const body = `
    fields 
      name,
      summary,
      first_release_date,
      platforms.name,
      involved_companies.company.id,
      involved_companies.company.name,
      involved_companies.publisher,
      involved_companies.developer,
      game_modes.name,
      game_engines.name,
      player_perspectives.name,
      age_ratings,
      themes.name,
      franchises.name,
      genres.id,
      genres.name,
      genres.slug,
      videos.name,
      videos.video_id,
      screenshots.url,
      language_supports,
      alternative_names.name,
      alternative_names.comment;
    where id = ${igdbId};
    limit 1;
  `;

  const response = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('Failed to fetch full IGDB data');
  }

  const data = await response.json();
  const game = data[0] || null;

  return game;
}

async function fetchFromRawgBySlug(slug: string): Promise<RawgGame | null> {
  const response = await fetch(`https://api.rawg.io/api/games/${slug}?key=${process.env.NEXT_PUBLIC_RAWG_API_KEY}&platforms=4`); // platforms=4 is for PC
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch from RAWG API');
  }
  const rawgGame = await response.json();
  return rawgGame;
}

// Helper to filter out invalid age rating IDs
async function filterValidAgeRatingIds(ids: number[]): Promise<number[]> {
    const validIds: number[] = [];
    for (const id of ids) {
        const query = `fields id; where id = (${id}); limit 1;`;
        const igdbToken = await getIgdbToken();
        const response = await fetch('https://api.igdb.com/v4/age_ratings', {
            method: 'POST',
            headers: {
                'Client-ID': process.env.IGDB_CLIENT_ID!,
                'Authorization': `Bearer ${igdbToken}`,
                'Content-Type': 'text/plain'
            },
            body: query
        });
        if (response.ok) validIds.push(id);
    }
    return validIds;
}

// Utility: Validate IGDB age rating IDs before batch query
async function getValidAgeRatingIds(ids: number[]): Promise<number[]> {
    const validIds: number[] = [];
    for (const id of ids) {
        if (typeof id !== 'number' || id <= 0) continue;
        const query = `fields id; where id = (${id}); limit 1;`;
        const igdbToken = await getIgdbToken();
        const response = await fetch('https://api.igdb.com/v4/age_ratings', {
            method: 'POST',
            headers: {
                'Client-ID': process.env.IGDB_CLIENT_ID!,
                'Authorization': `Bearer ${igdbToken}`,
                'Content-Type': 'text/plain'
            },
            body: query
        });
        if (response.ok) {
            validIds.push(id);
        } else {
            const errorBody = await response.text();
        }
    }
    return validIds;
}

// --- ADDITIONAL RAWG API FUNCTIONS ---

async function fetchGameAdditions(gameId: string, page: number = 1) {
  const response = await fetch(
    `https://api.rawg.io/api/games/${gameId}/additions?key=${process.env.NEXT_PUBLIC_RAWG_API_KEY}&page=${page}&page_size=20`
  );
  if (!response.ok) return null;
  return response.json();
}

async function fetchGameSeries(gameId: string, page: number = 1) {
  const response = await fetch(
    `https://api.rawg.io/api/games/${gameId}/game-series?key=${process.env.NEXT_PUBLIC_RAWG_API_KEY}&page=${page}&page_size=20`
  );
  if (!response.ok) return null;
  return response.json();
}

async function fetchParentGames(gameId: string, page: number = 1) {
  const response = await fetch(
    `https://api.rawg.io/api/games/${gameId}/parent-games?key=${process.env.NEXT_PUBLIC_RAWG_API_KEY}&page=${page}&page_size=20`
  );
  if (!response.ok) return null;
  return response.json();
}

// --- THE MASTER ORCHESTRATOR FUNCTION ---

export type GameApiResponse = UnifiedGameData & { comments: any[]; upvotes: number; downvotes: number; slug: string; views: number };

export async function getUnifiedGameData(slug: string): Promise<GameApiResponse> {
  // --- STEP 1: DEFINE CACHE DURATION AND CHECK THE DATABASE ---
  const CACHE_DURATION_IN_DAYS = 7;
  const cacheCutoffDate = new Date();
  cacheCutoffDate.setDate(cacheCutoffDate.getDate() - CACHE_DURATION_IN_DAYS);

  const cachedGame = await prisma.gameCache.findUnique({
    where: { slug: slug },
  });

  // --- STEP 2: CHECK IF THE CACHE IS "FRESH" ---
  if (cachedGame && cachedGame.updatedAt > cacheCutoffDate) {
    // Fetch comments for the game
    const comments = await prisma.comment.findMany({
      where: { gameSlug: slug },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, email: true, username: true, name: true, profileImage: true }
        }
      }
    });
    // Fix tags type if needed
    let gameData = cachedGame.gameData as any;
    if (Array.isArray(gameData.tags) && gameData.tags.length > 0 && typeof gameData.tags[0].source === 'undefined') {
      gameData.tags = gameData.tags.map((tag: any) => ({ ...tag, source: 'rawg' }));
    }
    return { ...gameData, comments, upvotes: cachedGame.upvotes, downvotes: cachedGame.downvotes, slug: cachedGame.slug, views: cachedGame.views };
  }

  // If we reach this point, it's either a cache miss or the data is stale.
  if (cachedGame) {
    // Fetch comments for the game
    const comments = await prisma.comment.findMany({
      where: { gameSlug: slug },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, email: true, username: true, name: true, profileImage: true }
        }
      }
    });
    // Fix tags type if needed
    let gameData = cachedGame.gameData as any;
    if (Array.isArray(gameData.tags) && gameData.tags.length > 0 && typeof gameData.tags[0].source === 'undefined') {
      gameData.tags = gameData.tags.map((tag: any) => ({ ...tag, source: 'rawg' }));
    }
    return { ...gameData, comments, upvotes: cachedGame.upvotes, downvotes: cachedGame.downvotes, slug: cachedGame.slug, views: cachedGame.views };
  }
  
  // --- STEP 3: FETCH FRESH DATA FROM APIS ---
  const freshUnifiedData = await fetchAndProcessGameDataFromAPIs(slug);

  if (!freshUnifiedData) {
    throw new Error(`Failed to fetch any data for slug: ${slug}`);
  }

  // --- STEP 4: UPDATE THE CACHE WITH THE FRESH DATA ---
  try {
    await prisma.gameCache.upsert({
      where: { slug: slug },
      update: {
        gameData: freshUnifiedData as any,
      },
      create: {
        slug: slug,
        gameData: freshUnifiedData as any,
      },
    });
  } catch (error) {
    // Continue without additional data if there's an error
  }

  // Fetch comments for the game
  const comments = await prisma.comment.findMany({
    where: { gameSlug: slug },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { id: true, email: true, username: true, name: true, profileImage: true }
      }
    }
  });

  return { ...freshUnifiedData, comments, upvotes: 0, downvotes: 0, slug, views: 0 };
}

// Move the original getUnifiedGameData logic here
async function fetchAndProcessGameDataFromAPIs(slug: string): Promise<UnifiedGameData | null> {
  try {
    // Step 1: Fetch RAWG data using slug
    let rawgGame = await fetchFromRawgBySlug(slug);
    if (!rawgGame) {
      // Fallback: Try searching by name if direct slug fetch fails
      const searchRes = await fetch(`https://api.rawg.io/api/games?key=${process.env.NEXT_PUBLIC_RAWG_API_KEY}&search=${encodeURIComponent(slug)}&page_size=1`);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.results && searchData.results.length > 0) {
          const altSlug = searchData.results[0].slug;
          rawgGame = await fetchFromRawgBySlug(altSlug);
        }
      }
    }
    if (!rawgGame) {
      throw new Error('Game not found on RAWG');
    }

    // Fetch RAWG screenshots
    let rawgScreenshots: Array<{ id: number | string; image: string }> = [];
    try {
      const rawgShotResults = await fetchRawgScreenshots(String(rawgGame.id));
      rawgScreenshots = (rawgShotResults || []).map((ss: any) => ({ id: ss.id, image: ss.image }));
    } catch (e) {
      // Ignore screenshot errors
    }

    // Start with RAWG developers and publishers
    const rawgDevelopers = (rawgGame.developers || []).map((d: { name: string }) => ({ name: d.name }));
    // RAWG does not provide publishers in the default object, so leave as empty array
    const rawgPublishers: Array<{ name: string }> = [];

    // Create the unified data object with RAWG data
    const { tags, ...rawgGameRest } = rawgGame;
    const unifiedData: UnifiedGameData = {
      ...rawgGameRest,
      screenshots: rawgScreenshots,
      website: rawgGame.website || null,
      developers: rawgDevelopers,
      publishers: rawgPublishers,
      // tags will be assigned later with the correct structure
    };

    // Get IGDB data
    let igdbId: number | null = null;
    
    // First try to get from cache
    const cachedGame = await prisma.gameCache.findUnique({
      where: { rawgId: Number(rawgGame.id) },
    });

    if (cachedGame && cachedGame.igdbId) {
      igdbId = cachedGame.igdbId;
    } else {
      const year = new Date(rawgGame.released).getFullYear().toString();
      const igdbCandidate = await fetchFromIgdb({
        name: rawgGame.name,
        slug: slug,
        year
      });

      if (igdbCandidate) {
        igdbId = igdbCandidate.id;
        // Cache the successful match in GameCache
        await prisma.gameCache.upsert({
          where: { slug: slug },
          update: {
            rawgId: Number(rawgGame.id),
            igdbId: igdbCandidate.id,
          },
          create: {
            slug: slug,
            rawgId: Number(rawgGame.id),
            igdbId: igdbCandidate.id,
            gameData: {}, // You can adjust this if you want to store more initial data
          },
        });
      }
    }

    // Get IGDB data
    if (igdbId) {
      const fullIgdbData = await fetchFullIgdbData(igdbId);
      
      if (fullIgdbData) {
        // Fetch completion times
        const completionTimes = await fetchCompletionTimes(igdbId);
        if (completionTimes) {
          unifiedData.completion_times = completionTimes;
        }

        // Handle IGDB involved companies (developers and publishers)
        if (fullIgdbData.involved_companies && fullIgdbData.involved_companies.length > 0) {
          const companyIds = fullIgdbData.involved_companies.map(ic => ic.company.id);
          // IGDB companies fetch using correct plain text query (per IGDB docs)
          const companyFields = 'id,name';
          const companyQuery = `fields ${companyFields}; where id = (${companyIds.join(',')}); limit ${companyIds.length};`;
          const companyRes = await fetch('https://api.igdb.com/v4/companies', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Client-ID': process.env.IGDB_CLIENT_ID!,
              'Authorization': `Bearer ${await getIgdbToken()}`,
              'Content-Type': 'text/plain',
            },
            body: companyQuery,
          });
          const companies = await companyRes.json();
          const companyMap = new Map(companies.map((c: { id: number, name: string }) => [c.id, c.name]));
          
          // Extract developer and publisher company IDs from involved_companies
          const developerIds = fullIgdbData.involved_companies
            .filter((ic: any) => ic.developer)
            .map((ic: any) => ic.company.id);
          const publisherIds = fullIgdbData.involved_companies
            .filter((ic: any) => ic.publisher)
            .map((ic: any) => ic.company.id);

          // Map IDs to names
          const developers: Array<{ id?: number; name: string }> = developerIds.map((id: number) => ({ 
            name: String(companyMap.get(id) ?? 'Unknown Developer')
          }));
          const publishers: Array<{ id?: number; name: string }> = publisherIds.map((id: number) => ({ 
            name: String(companyMap.get(id) ?? 'Unknown Publisher')
          }));

          // Merge with RAWG data, avoiding duplicates
          const existingDevNames = new Set(unifiedData.developers?.map((d: { name: string }) => d.name.toLowerCase()) || []);
          const existingPubNames = new Set(unifiedData.publishers?.map((p: { name: string }) => p.name.toLowerCase()) || []);

          unifiedData.developers = [
            ...(unifiedData.developers || []),
            ...developers.filter((d: { name: string }) => !existingDevNames.has(d.name.toLowerCase()))
          ];

          unifiedData.publishers = [
            ...(unifiedData.publishers || []),
            ...publishers.filter((p: { name: string }) => !existingPubNames.has(p.name.toLowerCase()))
          ];
        }

        // Add IGDB screenshots (combine with RAWG, deduplicate)
        if (fullIgdbData.screenshots && fullIgdbData.screenshots.length > 0) {
          const igdbScreens = fullIgdbData.screenshots.map(ss => ({
            id: `igdb-${ss.url.split('/').pop()}`,
            image: ss.url.replace('thumb', '1080p')
          }));
          // Combine RAWG and IGDB screenshots, RAWG first, deduplicate by image URL
          const allScreens = [...unifiedData.screenshots, ...igdbScreens];
          const seen = new Set<string>();
          unifiedData.screenshots = allScreens.filter(ss => {
            const url = ss.image.split('?')[0];
            if (seen.has(url)) return false;
            seen.add(url);
            return true;
          });
        }

        // Add IGDB fields
        let finalAgeRatings = [];
        let ageRatingIds = fullIgdbData?.age_ratings;
        ageRatingIds = (ageRatingIds || []).filter(id => typeof id === 'number' && id > 0);
        if (ageRatingIds && ageRatingIds.length > 0) {
            ageRatingIds = await getValidAgeRatingIds(ageRatingIds);
            if (ageRatingIds.length > 0) {
                try {
                    // 1. Fetch age rating objects (reference fields only)
                    const ageRatingObjects = await fetchIgdbDataByIds(
                        'age_ratings',
                        'organization,rating_category,rating_content_descriptions',
                        ageRatingIds
                    );

                    // 2. Collect all unique referenced IDs
                    const orgIds = [...new Set(ageRatingObjects.map((ar: any) => ar.organization).filter(Boolean))];
                    const categoryIds = [...new Set(ageRatingObjects.map((ar: any) => ar.rating_category).filter(Boolean))];
                    const contentIds = [...new Set(ageRatingObjects.flatMap((ar: any) => ar.rating_content_descriptions || []).filter(Boolean))];

                    // 3. Fetch all referenced details
                    const [orgs, categories, contents] = await Promise.all([
                        fetchIgdbDataByIds('age_rating_organizations', 'name', orgIds as number[]),
                        fetchIgdbDataByIds('age_rating_categories', 'rating', categoryIds as number[]),
                        fetchIgdbDataByIds('age_rating_content_descriptions', 'description', contentIds as number[]),
                    ]);

                    // 4. Build lookup maps and join
                    const orgMap = new Map(orgs.map((o: any) => [o.id, o.name]));
                    const categoryMap = new Map(categories.map((c: any) => [c.id, c.rating]));
                    const contentMap = new Map(contents.map((c: any) => [c.id, c.description]));

                    finalAgeRatings = ageRatingObjects.map((ar: any) => ({
                        id: ar.id,
                        organization: { name: orgMap.get(ar.organization) || 'Unknown Org' },
                        rating_category: { rating: categoryMap.get(ar.rating_category) || 'Not Rated' },
                        rating_content_descriptions: (ar.rating_content_descriptions || [])
                            .map((id: any) => ({ id, description: contentMap.get(id) }))
                            .filter((d: any) => d.description)
                    }));
                } catch (error) {
                    // Handle age ratings error silently
                }
            }
        }

        // Add IGDB fields directly to unifiedData
        Object.assign(unifiedData, {
          summary: fullIgdbData.summary,
          franchises: fullIgdbData.franchises,
          game_engines: fullIgdbData.game_engines,
          game_modes: fullIgdbData.game_modes,
          player_perspectives: fullIgdbData.player_perspectives,
          themes: fullIgdbData.themes,
          genres: fullIgdbData.genres,
          age_ratings: finalAgeRatings,
          alternative_names: fullIgdbData.alternative_names
        });

        // Merge genres from both sources, avoiding duplicates
        if (fullIgdbData.genres && fullIgdbData.genres.length > 0) {
          const existingGenreNames = new Set(unifiedData.genres?.map((g: { name: string }) => g.name.toLowerCase()) || []);
          
          unifiedData.genres = [
            ...(unifiedData.genres || []),
            ...fullIgdbData.genres.filter((g: { name: string }) => !existingGenreNames.has(g.name.toLowerCase()))
          ];
        }

        // Handle IGDB videos
        if (fullIgdbData.videos && fullIgdbData.videos.length > 0) {
          unifiedData.video_data = {
            source: 'igdb',
            videos: fullIgdbData.videos,
          };
        }

        // --- IGDB Language Support (multi-step) ---
        // Prepare IGDB headers for additional fetches
        const igdbHeaders = {
          'Client-ID': process.env.IGDB_CLIENT_ID!,
          'Authorization': `Bearer ${await getIgdbToken()}`,
          'Content-Type': 'text/plain'
        };
        // 1. Fetch language_supports for this game
        const langSupportRes = await fetch('https://api.igdb.com/v4/language_supports', {
          method: 'POST',
          headers: igdbHeaders,
          body: `fields language,language_support_type; where game = ${igdbId}; limit 500;`
        });
        let supportedLanguagesData: Record<string, { audio: boolean; subtitles: boolean; interface: boolean }> = {};
        if (langSupportRes.ok) {
          const langSupports = await langSupportRes.json();
          if (langSupports.length > 0) {
            // 2. Collect unique language and support_type IDs
            const languageIds = Array.from(new Set(langSupports.map((ls: any) => ls.language)));
            const supportTypeIds = Array.from(new Set(langSupports.map((ls: any) => ls.language_support_type)));
            // 3. Fetch language names
            const langRes = await fetch('https://api.igdb.com/v4/languages', {
              method: 'POST',
              headers: igdbHeaders,
              body: `fields id,name; where id = (${languageIds.join(',')}); limit 500;`
            });
            const supportTypeRes = await fetch('https://api.igdb.com/v4/language_support_types', {
              method: 'POST',
              headers: igdbHeaders,
              body: `fields id,name; where id = (${supportTypeIds.join(',')}); limit 20;`
            });
            const languages = langRes.ok ? await langRes.json() : [];
            const supportTypes = supportTypeRes.ok ? await supportTypeRes.json() : [];
            // 4. Build lookup maps
            const langMap: Record<number, string> = {};
            languages.forEach((l: any) => { langMap[l.id] = l.name; });
            const typeMap: Record<number, string> = {};
            supportTypes.forEach((t: any) => { typeMap[t.id] = t.name.toLowerCase(); });
            // 5. Transform to display structure
            langSupports.forEach((ls: any) => {
              const langName = langMap[ls.language];
              const type = typeMap[ls.language_support_type];
              if (!langName || !type) return;
              if (!supportedLanguagesData[langName]) {
                supportedLanguagesData[langName] = { audio: false, subtitles: false, interface: false };
              }
              if (type.includes('audio')) supportedLanguagesData[langName].audio = true;
              if (type.includes('subtitles')) supportedLanguagesData[langName].subtitles = true;
              if (type.includes('interface')) supportedLanguagesData[langName].interface = true;
            });
          }
        }
        unifiedData.supported_languages = supportedLanguagesData;
        // --- END IGDB Language Support ---

        // --- TAGS & KEYWORDS MERGE (RAWG + IGDB) ---
        let rawgTags: { id: number; name: string; source: string }[] = [];
        if (rawgGame.tags && Array.isArray(rawgGame.tags)) {
          rawgTags = rawgGame.tags.map((tag: any) => ({
            id: tag.id,
            name: tag.name,
            source: 'rawg',
          }));
        }

        let igdbTags: { id: number; name: string; source: string }[] = [];
        if (igdbId) {
          // Fetch IGDB keywords if available
          const fullIgdbData = await fetchFullIgdbData(igdbId);
          if (fullIgdbData && fullIgdbData.keywords && Array.isArray(fullIgdbData.keywords) && fullIgdbData.keywords.length > 0) {
            try {
              const igdbHeaders = {
                'Client-ID': process.env.IGDB_CLIENT_ID!,
                'Authorization': `Bearer ${await getIgdbToken()}`,
                'Content-Type': 'text/plain',
              };
              const keywordRes = await fetch('https://api.igdb.com/v4/keywords', {
                method: 'POST',
                headers: igdbHeaders,
                body: `fields id, name; where id = (${fullIgdbData.keywords.join(',')}); limit 100;`,
              });
              if (keywordRes.ok) {
                const igdbKeywords = await keywordRes.json();
                igdbTags = igdbKeywords.map((kw: any) => ({
                  id: kw.id,
                  name: kw.name,
                  source: 'igdb',
                }));
              }
            } catch (err) {
              console.warn('Failed to fetch IGDB keywords:', err);
            }
          }
        }
        // Merge and dedupe tags (prefer RAWG)
        const seenTagNames = new Set<string>();
        const mergedTags: { id: number; name: string; source: string }[] = [
          ...rawgTags,
          ...igdbTags.filter(tag => {
            const key = tag.name.toLowerCase();
            if (seenTagNames.has(key)) return false;
            seenTagNames.add(key);
            return true;
          })
        ];
        if (mergedTags.length > 0) {
          (unifiedData as any).tags = mergedTags;
        }
      }
    }

    // RAWG fallback for videos if no IGDB videos
    if (!unifiedData.video_data && rawgGame.clip && typeof rawgGame.clip === 'object') {
      unifiedData.video_data = {
        source: 'rawg',
        clip: rawgGame.clip,
      };
    }

    // Fetch additional RAWG data
    try {
      const [additionsData, seriesData, parentGamesData] = await Promise.allSettled([
        fetchGameAdditions(String(rawgGame.id)),
        fetchGameSeries(String(rawgGame.id)),
        fetchParentGames(String(rawgGame.id))
      ]);

      // Add successful results to unified data
      if (additionsData.status === 'fulfilled' && additionsData.value) {
        unifiedData.additions = additionsData.value.results;
      }
      
      if (seriesData.status === 'fulfilled' && seriesData.value) {
        unifiedData.game_series = seriesData.value.results;
      }
      
      if (parentGamesData.status === 'fulfilled' && parentGamesData.value) {
        unifiedData.parent_games = parentGamesData.value.results;
      }
    } catch (error) {
      // Continue without additional data if there's an error
    }

    // RAWG fallback for age ratings if IGDB is missing or empty
    if ((!unifiedData.age_ratings || unifiedData.age_ratings.length === 0)) {
      const rawgAgeRatings: any[] = [];
      // RAWG esrb_rating (single object)
      if (rawgGame.esrb_rating && rawgGame.esrb_rating.name) {
        rawgAgeRatings.push({
          id: rawgGame.esrb_rating.id,
          organization: { name: 'ESRB' },
          rating_category: { rating: rawgGame.esrb_rating.name },
          rating_cover_url: undefined,
          rating_content_descriptions_v2: []
        });
      }
      // RAWG age_ratings (array, e.g. PEGI, CERO, etc.)
      if (rawgGame.age_ratings && Array.isArray(rawgGame.age_ratings)) {
        for (const ar of rawgGame.age_ratings) {
          // Map known categories (e.g. PEGI, CERO, etc.)
          let orgName = 'Unknown';
          if (ar.category === 1) orgName = 'ESRB';
          if (ar.category === 2) orgName = 'PEGI';
          if (ar.category === 3) orgName = 'CERO';
          if (ar.category === 4) orgName = 'USK';
          if (ar.category === 5) orgName = 'GRAC';
          if (ar.category === 6) orgName = 'CLASSIND';
          if (ar.category === 7) orgName = 'ACB';
          rawgAgeRatings.push({
            id: ar.id,
            organization: { name: orgName },
            rating_category: { rating: ar.title || ar.description || String(ar.rating) },
            rating_cover_url: ar.rating_cover_url,
            rating_content_descriptions_v2: []
          });
        }
      }
      if (rawgAgeRatings.length > 0) {
        unifiedData.age_ratings = rawgAgeRatings;
      }
    }

    return unifiedData;
  } catch (error) {
    return null;
  }
}

// --- DETAILED MATCHING LOGIC ---
function findBestIgdbMatch(rawgGame: RawgGame, igdbCandidates: IgdbCandidate[]): IgdbCandidate | null {
  if (igdbCandidates.length === 0) {
    return null;
  }

  // Prepare a list of all names (main + alternative) for each candidate
  const candidatesWithAltNames = igdbCandidates.map(candidate => {
    const altNames = (candidate as any).alternative_names?.map((alt: any) => alt.name) || [];
    return {
      ...candidate,
      allNames: [candidate.name, ...altNames]
    };
  });

  const fuse = new Fuse(candidatesWithAltNames, {
    keys: ['allNames'],
    includeScore: true,
    threshold: 0.4
  });

  let bestMatch: { candidate: IgdbCandidate, score: number } | null = null;
  const potentialMatches = fuse.search(rawgGame.name);
  
  for (const result of potentialMatches) {
    const igdbCandidate = result.item;
    let currentScore = 0;
    let scoreBreakdown = {
      name: 0,
      year: 0,
      platform: 0,
      developer: 0,
      exactName: 0,
      altName: 0
    };

    // 1. Name Score (fuzzy)
    if (result.score != null) {
      if (result.score < 0.3) { 
        scoreBreakdown.name = 2;
      } else { 
        scoreBreakdown.name = 1;
      }
    }
    currentScore += scoreBreakdown.name;

    // 1b. Exact name match bonus
    const rawgNameLower = rawgGame.name.trim().toLowerCase();
    const allCandidateNames = igdbCandidate.allNames.map((n: string) => n.trim().toLowerCase());
    if (allCandidateNames.includes(rawgNameLower)) {
      scoreBreakdown.exactName = 2;
      currentScore += 2;
    }

    // 2. Year Match
    if (rawgGame.released && igdbCandidate.first_release_date) {
      const rawgYear = new Date(rawgGame.released).getFullYear();
      const igdbYear = new Date(igdbCandidate.first_release_date * 1000).getFullYear();
      if (rawgYear === igdbYear) {
        scoreBreakdown.year = 2;
      }
    }
    currentScore += scoreBreakdown.year;

    // 3. Platform Overlap
    if (rawgGame.platforms && igdbCandidate.platforms && igdbCandidate.platforms.length > 0) {
      const rawgPlatforms = rawgGame.platforms.map(p => p.platform.name.toLowerCase());
      const igdbPlatforms = igdbCandidate.platforms.map(p => p.name.toLowerCase());
      const commonPlatforms = rawgPlatforms.filter(rp => igdbPlatforms.includes(rp));
      if (commonPlatforms.length > 0) {
        scoreBreakdown.platform = 1;
      }
    }
    currentScore += scoreBreakdown.platform;
    
    // 4. Developer Overlap
    if (rawgGame.developers && igdbCandidate.involved_companies && igdbCandidate.involved_companies.length > 0) {
      const rawgDevs = rawgGame.developers.map(d => d.name.toLowerCase());
      const igdbCompanies = igdbCandidate.involved_companies.map(c => c.company.name.toLowerCase());
      const commonDevs = rawgDevs.filter(rd => igdbCompanies.includes(rd));
      if (commonDevs.length > 0) {
        scoreBreakdown.developer = 1;
      }
    }
    currentScore += scoreBreakdown.developer;

    if (!bestMatch || currentScore > bestMatch.score) {
      bestMatch = { candidate: igdbCandidate, score: currentScore };
    }
  }
  
  const confidenceThreshold = 5; // raised since max score is now 8
  if (bestMatch && bestMatch.score >= confidenceThreshold) {
    return bestMatch.candidate;
  }

  return null;
}

export async function searchGames(query: string, page: number = 1) {
  if (!query || !query.trim()) {
    return { results: [], count: 0, next: null };
  }

  // Remove year filtering, just search by the full query
  const response = await fetch(
    `https://api.rawg.io/api/games?key=${process.env.NEXT_PUBLIC_RAWG_API_KEY}&search=${encodeURIComponent(query)}&page=${page}&page_size=20&ordering=-added,-rating,-metacritic`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch search results from RAWG API.');
  }

  const data = await response.json();
  
  return {
    results: data.results,
    count: data.count,
    next: data.next
  };
}
