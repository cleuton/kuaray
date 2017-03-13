/*

*/
var assure = {
    self : this,
    exists : function(what,msg) {
        if(typeof what == 'undefined') {
            throw new Error(msg);
        }
        return this;
    },
    notNull : function(what,msg) {
        if(what == null) {
            throw new Error(msg);
        }
        return this;
    },
    number : function(what,msg) {
        if(isNaN(what) || (typeof what != 'number')) {
            throw new Error(msg);
        }
        return this;
    }

};

module.exports = assure;