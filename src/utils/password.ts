import argon2 from 'argon2';

export const hashPassword = (password: string) => argon2.hash(password);

export const verifyPassword = (hash: string, password: string) => argon2.verify(hash, password);

export const isStrongPassword = (password: string) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  return regex.test(password);
}