import argon2 from 'argon2'

// Detect Argon2id hashes (argon2 package uses PHC strings like: $argon2id$v=19$m=...)
export const isArgon2Hash = (value) => {
  if (typeof value !== 'string') return false
  return value.startsWith('$argon2id$') || value.startsWith('$argon2i$') || value.startsWith('$argon2d$')
}

export const hashPasswordArgon2id = async (password) => {
  // Argon2id mode
  return argon2.hash(password, {
    type: argon2.argon2id,
  })
}

