module.exports = {
  generateRandomPassword(length = 12) {
    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerCase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*()_+[]{}|;:',.<>?";
    const allChars = upperCase + lowerCase + numbers + specialChars;

    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allChars.length);
      password += allChars[randomIndex];
    }

    // Ensure the password includes at least one of each character type
    password =
      upperCase[Math.floor(Math.random() * upperCase.length)] +
      lowerCase[Math.floor(Math.random() * lowerCase.length)] +
      numbers[Math.floor(Math.random() * numbers.length)] +
      specialChars[Math.floor(Math.random() * specialChars.length)] +
      password.slice(4);

    return password.split('').sort(() => 0.5 - Math.random()).join(''); // Shuffle the password
  }
}

