//const passwordReg = /(?=.*([a-zA-Z].*))(?=.*[0-9].*)[a-zA-Z0-9-*/+.~!@#$%^&*()]{6,20}$/; //must contain number and letter length 6-20
const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function validatePassword(password) {
  // return passwordReg.test(password);
  return password.length > 4 && password.length < 30;
}

function validateEmail(email) {
  return emailReg.test(email);
}

let validator = {
  validatePassword: validatePassword,
  validateEmail: validateEmail,
};

export default validator;
