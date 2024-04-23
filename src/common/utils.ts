import {LandingPageRepository} from '../repositories/landingpage.repository';

// get unique name for column in table
export const getLandingPageUniqueName = (
  repository: LandingPageRepository,
  fullName: string[]
): Promise<string> => {
  const originalUniqueName = encodeURIComponent(
    fullName
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9-]/gi, "")
  );
  return new Promise((resolve, reject) => {
    repository.find({
      where: {uniqueName: originalUniqueName},
      order: ["id DESC"],
      fields: ["uniqueName"]
    })
      .then((result) => {
        if (!result || !result.length) {
          // nobody with the same names
          resolve(originalUniqueName);
        } else {
          const lastUsedUniqueName = result[0].uniqueName;
          const namesDiff = lastUsedUniqueName.replace(originalUniqueName, "");
          if (namesDiff.length > 0) {
            const names = lastUsedUniqueName.split("-");
            // Remove the last part from the unique name to check if it's a counter
            const counter = Number(names.pop());
            // last part of the unique name is a counter, we increment it
            resolve(`${names.join("-")}-${counter + 1}`);
          } else {
            // No counters yet, we add one
            resolve(`${lastUsedUniqueName}-1`);
          }
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export default getLandingPageUniqueName;
