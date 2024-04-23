import HttpError, {STATUS_BAD_REQUEST} from './http';

export const validateColor = (field: string, name: string): void => {
  const reg = /^#([0-9a-f]{3}){1,2}$/i;
  if (reg.test(field) === false) {
    throw new HttpError(
      `${name} has an invalid color format`,
      STATUS_BAD_REQUEST
    );
  }
}

export const throwIfEmpty = (field: unknown, name: string): void => {
  if (!field && field !== 0 && field !== false) {
    throw new HttpError(
      `${name} is required`,
      STATUS_BAD_REQUEST
    );
  }
};

export const validateArray = (field: unknown, name: string): void => {
  if (!Array.isArray(field)) {
    throw new HttpError(
      `${name} should be an array`,
      STATUS_BAD_REQUEST
    );
  }
};

export const validateUrl = (field: string, name: string): void => {
  // if field is null the regex test alone
  // will cause a false positive (/^[a-z0-9-_]+$/i.test(null) = true)
  if (field && /^[a-z0-9-_]+$/i.test(field)) {
    return;
  }
  throw new HttpError(
    `${name} can only contain the following characters: alphabet, number and -_`,
    STATUS_BAD_REQUEST
  );
};

export const throwIfLongerThanArray = <T>(
  field: Array<T>,
  name: string,
  max: number
): void => {
  validateArray(field, name);
  if (field.length > max) {
    throw new HttpError(
      `${name} should be less than ${max}`,
      STATUS_BAD_REQUEST
    );
  }
};

export const throwIfShorterThanArray = <T>(
  field: Array<T>,
  name: string,
  min: number
): void => {
  validateArray(field, name);
  if (field.length < min) {
    throw new HttpError(
      `${name} should be greater than ${min}`,
      STATUS_BAD_REQUEST
    );
  }
};

export const throwIfLongerThan = (
  field: string,
  name: string,
  max: number
): void => {
  if (typeof field !== "string") {
    throw new HttpError(
      `${name} should be a valid string`,
      STATUS_BAD_REQUEST
    );
  } else if (field.length > max) {
    throw new HttpError(
      `${name} should be less than ${max} characters`,
      STATUS_BAD_REQUEST
    );
  }
};

export const throwIfShorterThan = (
  field: string,
  name: string,
  min: number
): void => {
  if (typeof field !== "string") {
    throw new HttpError(
      `${name} should be a valid string`,
      STATUS_BAD_REQUEST
    );
  } else if (field.length < min) {
    throw new HttpError(
      `${name} should be at least ${min} characters`,
      STATUS_BAD_REQUEST
    );
  }
};

export const throwIfGreaterThan = (
  field: number,
  name: string,
  max: number
): void => {
  if (typeof field !== "number") {
    throw new HttpError(
      `${name} should be a valid number`,
      STATUS_BAD_REQUEST
    );
  } else if (field > max) {
    throw new HttpError(
      `${name} should be less than or equal to ${max}`,
      STATUS_BAD_REQUEST
    );
  }
};

export const throwIfLessThan = (
  field: number,
  name: string,
  min: number
): void => {
  if (typeof field !== "number") {
    throw new HttpError(
      `${name} should be a valid number`,
      STATUS_BAD_REQUEST
    );
  } else if (field < min) {
    throw new HttpError(
      `${name} should be greater than or equal to ${min}`,
      STATUS_BAD_REQUEST
    );
  }
};
