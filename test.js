// import functions from '../functions'
const axios = require('axios');

console.log('======= testing /users/login =======');
const testUsers = async () => {
  let res;
  let validTest;
  let options = {
    method: 'POST',
    headers: {'content-type': 'application/json'}
  };

  let resTestLogin = (res, t, expectTextResponse) => {
    let valid = true;

    if (!res.response) {
      console.log(`-- ERROR ${t}: in res not RESPONSE`);
      valid = false;
    }

    res = res.response ? res.response : res;
    if (res.status !== 422) {
      console.log(`-- ERROR ${t}: status is must by 422`);
      valid = false;
    }

    if (!res.data.errors || res.data.errors !== expectTextResponse) {
      console.log(`-- ERROR ${t}: response must by: ${expectTextResponse}`);
      valid = false;
    }

    return valid;
  };
  let resTestReg = (res, t) => {
    let userData = true;

    if (res.response) {
      console.log(`-- ERROR ${t}: in res isset RESPONSE`);
      userData = false;
    }

    res = res.response ? res.response : res;
    if (res.status !== 200) {
      console.log(`-- ERROR ${t}: status is must by 200`);
      userData = false;
    }

    if (!res.data.user) {
      console.log(`-- ERROR ${t}: in res not user object`);
      userData = false;
    }

    if (!res.data.user.token) {
      console.log(`-- ERROR ${t}: in res not user.token`);
      userData = false;
    }

    if (userData) userData = res.data.user.token;
    return userData;
  };

  // -- по сути тестируем utils.checkUserData
  // этот middleware используется и в /users/login и в /users/registration
  console.log('== validate data ... ==');

  options.url = 'http://localhost:7777/api/users/login';

  // тест объекта user
  options.data = '';
  res = await axios(options).then(v => v).catch(v => v);
  validTest = resTestLogin(res, 'test 1', 'object User is required');
  if(!validTest) return;

  options.data = {use: {}};
  res = await axios(options).then(v => v).catch(v => v);
  validTest = resTestLogin(res, 'test 2', 'object User is required');
  if(!validTest) return;

  options.data = {use: {a1: '', a2: ''}};
  res = await axios(options).then(v => v).catch(v => v);
  validTest = resTestLogin(res, 'test 3', 'object User is required');
  if(!validTest) return;

  // тест user.email
  options.data = {user: {}};
  res = await axios(options).then(v => v).catch(v => v);
  validTest = resTestLogin(res, 'test 4', 'email is required');
  if(!validTest) return;

  options.data = {user: {a1: '', a2: ''}};
  res = await axios(options).then(v => v).catch(v => v);
  validTest = resTestLogin(res, 'test 5', 'email is required');
  if(!validTest) return;

  options.data = {user: {email: '', a2: ''}};
  res = await axios(options).then(v => v).catch(v => v);
  validTest = resTestLogin(res, 'test 6', 'email is required');
  if(!validTest) return;

  // тест user.password
  options.data = {user: {email: 'test@mail.ru', a2: ''}};
  res = await axios(options).then(v => v).catch(v => v);
  validTest = resTestLogin(res, 'test 7', 'password is required');
  if(!validTest) return;

  options.data = {user: {email: 'test@mail.ru', password: ''}};
  res = await axios(options).then(v => v).catch(v => v);
  validTest = resTestLogin(res, 'test 8', 'password is required');
  if(!validTest) return;

  // тест наличия юзера в базе (изначально его нет)
  options.data = {user: {email: 'test1@mail.ru', password: 'test1'}};
  res = await axios(options).then(v => v).catch(v => v);
  validTest = resTestLogin(res, 'test 9', 'email or password: is invalid');
  if(!validTest) return;

  // регим юзера
  options.url = 'http://localhost:7777/api/users/registration';
  options.data = {user: {email: 'test1@mail.ru', password: 'test1'}};
  res = await axios(options).then(v => v).catch(v => v);
  validTest = resTestReg(res, 'test 10');
  if(!validTest) return;
  console.log(validTest);

};

testUsers();
