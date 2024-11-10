// This file contains the function to validate email addresses
// and sanitize them before being used in the app.


export const validateEmail = (email: string): boolean => {
    if (!email) {
        console.log('Validation failed: Email is empty');
        return false;
    }

    // Updated regex to allow more standard email formats with 2+ character TLDs
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
    const sanitizedEmail = email.trim().toLowerCase();
    const result = sanitizedEmail.match(regex);

    console.log(`Validating email: ${sanitizedEmail}`);
    console.log(`Regex match result: ${result ? 'valid' : 'invalid'}`);

    return !!result?.[0];
};

/*Old Validate Email Function 
export const validateEmail = (email: string): boolean => {
    if (!email) return false;
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{3})+$/;
    const sanitizedEmail = email.trim().toLowerCase();
    const result = sanitizedEmail.match(regex);
    return !!result?.[0];
}; */