module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'wherehasthesecretgone',
  API_SECRET: process.env.API_SECRET || 'fillintheapisecret',
  PORT: process.env.PORT || 5000
}