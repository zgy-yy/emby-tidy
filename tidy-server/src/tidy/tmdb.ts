import { MovieDb } from 'moviedb-promise';
import type {
  MovieResultsResponse,
  TvResultsResponse,
  SearchMultiResponse,
  MovieResult,
  TvResult,
} from 'moviedb-promise';
import { getConfig } from '@/config';

/** TMDB API 请求超时（毫秒），网络较慢或需代理时可适当增大 */
const TMDB_TIMEOUT_MS = 30_000;

const key = getConfig().tmdb.key 
const tmdb = new MovieDb(key);

const axiosConfig = { timeout: TMDB_TIMEOUT_MS };

export type { MovieResult, TvResult };

export interface SearchMoviesOptions {
  page?: number;
  year?: number;
  language?: string;
  includeAdult?: boolean;
}

export interface SearchTvOptions {
  page?: number;
  year?: number;
  firstAirDateYear?: number;
  language?: string;
  includeAdult?: boolean;
}

/**
 * 搜索电影
 */
export async function searchMovies(
  query: string,
  options: SearchMoviesOptions = {},
): Promise<MovieResultsResponse> {
  const { page = 1, year, language, includeAdult } = options;
  return tmdb.searchMovie(
    {
      query: query.trim(),
      page,
      ...(year != null && { year }),
      ...(language && { language }),
      ...(includeAdult != null && { include_adult: includeAdult }),
    },
    axiosConfig,
  );
}

/**
 * 搜索剧集（TV）
 */
export async function searchTv(
  query: string,
  options: SearchTvOptions = {},
): Promise<TvResultsResponse> {
  const { page = 1, year, firstAirDateYear, language, includeAdult } = options;
  return tmdb.searchTv(
    {
      query: query.trim(),
      page,
      ...(year != null && { year }),
      ...(firstAirDateYear != null && { first_air_date_year: firstAirDateYear }),
      ...(language && { language }),
      ...(includeAdult != null && { include_adult: includeAdult }),
    },
    axiosConfig,
  );
}

/**
 * 多类型搜索（电影 + 剧集 + 人物）
 */
export async function searchMulti(
  query: string,
  options: { page?: number; includeAdult?: boolean } = {},
): Promise<SearchMultiResponse> {
  const { page = 1, includeAdult } = options;
  return tmdb.searchMulti(
    {
      query: query.trim(),
      page,
      ...(includeAdult != null && { include_adult: includeAdult }),
    },
    axiosConfig,
  );
}

/**
 * 根据文件名/标题搜索媒体（先多类型，可按需再单独搜电影/剧集）
 */
export async function searchMedia(query: string, page = 1) {
  return searchMulti(query, { page });
}
