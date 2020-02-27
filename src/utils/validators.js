const RX_EMAIL = /^\S+@\S+\.[a-z\d]{2,5}$/i;

export const isEmail = (value) => {
    return RX_EMAIL.test(value);
}