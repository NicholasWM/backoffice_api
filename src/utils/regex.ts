// new Date().toLocaleDateString()
// "16/03/2021"

export const dateRegex = (str)=>{
  function isDate(str) {    
    let parms = str.split(/[\.\-\/]/);
    let yyyy = parseInt(parms[2],10);
    let mm   = parseInt(parms[1],10);
    let dd   = parseInt(parms[0],10);
    let date = new Date(yyyy,mm-1,dd,0,0,0,0);
    return mm === (date.getMonth()+1) && dd === date.getDate() && yyyy === date.getFullYear();
  }
  return isDate(str)
  // var dates = [
  //     "13-09-2011", 
  //     "13.09.2011",
  //     "13/09/2011",
  //     "08-08-1991",
  //     "29/02/2011"
  // ]
}