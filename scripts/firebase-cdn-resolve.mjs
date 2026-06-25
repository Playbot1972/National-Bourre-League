const CDN_PREFIX = "https://www.gstatic.com/firebasejs/";

const MODULE_MAP = {
  "firebase-app.js": "firebase/app",
  "firebase-auth.js": "firebase/auth",
  "firebase-firestore.js": "firebase/firestore",
  "firebase-functions.js": "firebase/functions",
};

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(CDN_PREFIX)) {
    const file = specifier.slice(specifier.lastIndexOf("/") + 1);
    const mapped = MODULE_MAP[file];
    if (mapped) {
      return nextResolve(mapped, context);
    }
  }
  return nextResolve(specifier, context);
}
