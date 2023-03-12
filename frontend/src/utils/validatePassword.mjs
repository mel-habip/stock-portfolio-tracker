
export default function validatePassword(password = '') {
    //requires a number, an uppercase, a lowercase and a special character, min 6, max 15
    const rule = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!?@()_\-+{}|[\]'#=.$%^&*])[a-zA-Z0-9!?@()_\-+{}|[\]'#=.$%^&*]{6,15}$/;
    return !!password.match(rule);
}