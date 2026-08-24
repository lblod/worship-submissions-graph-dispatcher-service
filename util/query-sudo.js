import { query, update } from "mu";
import {
  SUDO_QUERY_RETRY as RETRY,
  SUDO_QUERY_RETRY_MAX_ATTEMPTS as RETRY_MAX_ATTEMPTS,
  SUDO_QUERY_RETRY_FOR_HTTP_STATUS_CODES as RETRY_FOR_HTTP_STATUS_CODES,
  SUDO_QUERY_RETRY_FOR_CONNECTION_ERRORS as RETRY_FOR_CONNECTION_ERRORS,
  SUDO_QUERY_RETRY_TIMEOUT_INCREMENT_FACTOR as RETRY_TIMEOUT_INCREMENT_FACTOR,
} from "../config";

async function executeWithRetry(executor, queryString, attempt = 0) {
  try {
    return await executor(queryString, { sudo: true });
  } catch (ex) {
    if (mayRetry(ex, attempt)) {
      attempt += 1;
      const sleepTime = nextAttemptTimeout(attempt);
      console.log(`Sleeping ${sleepTime} ms before next attempt`);
      await new Promise((r) => setTimeout(r, sleepTime));
      return await executeWithRetry(executor, queryString, attempt);
    } else {
      console.log(`Failed Query: ${queryString}`);
      throw ex;
    }
  }
}

export function querySudo(queryString) {
  return executeWithRetry(query, queryString);
}

export function updateSudo(queryString) {
  return executeWithRetry(update, queryString);
}

function mayRetry(error, attempt) {
  console.log(`Checking retry allowed for error: ${error} and attempt: ${attempt}`);
  let shouldRetry = false;
  if (!RETRY) {
    shouldRetry = false;
  } else if (attempt < RETRY_MAX_ATTEMPTS) {
    if (error.code && RETRY_FOR_CONNECTION_ERRORS.includes(error.code)) {
      shouldRetry = true;
    } else if (
      error.httpStatus &&
      RETRY_FOR_HTTP_STATUS_CODES.includes(`${error.httpStatus}`)
    ) {
      shouldRetry = true;
    }
  }
  console.log(`Retry allowed? ${shouldRetry}`);
  return shouldRetry;
}

function nextAttemptTimeout(attempt) {
  return Math.round(RETRY_TIMEOUT_INCREMENT_FACTOR * Math.exp(attempt + 10));
}
