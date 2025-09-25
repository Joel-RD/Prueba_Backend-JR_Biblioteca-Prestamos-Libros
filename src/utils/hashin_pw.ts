
import argon2 from 'argon2';

export const hashing_password = async (password: string) => {
    try {
        const hash = await argon2.hash(password);
        return hash
    } catch (error) {
        console.log(error)
    }
}

export const verify_password = async (hashing_password: string, password: string) => {
    try {
        const hash = await argon2.verify(hashing_password, password);
        return hash
    } catch (error) {
        console.log(error)
    }
}

export const isSegurePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
}