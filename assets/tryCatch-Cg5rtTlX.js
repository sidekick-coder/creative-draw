async function n(t){try{return[null,await t()]}catch(r){return[r,null]}}n.sync=function(t){try{return[t(),null]}catch(r){return[null,r]}};export{n as t};
