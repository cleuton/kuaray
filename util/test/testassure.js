var Assure = require('../assure');

/*
var x;
Assure.exists(x,'Não existe x');
*/

Assure.exists(num,'Não existe').notNull(num,'Nulo').number(num,'Inválido');