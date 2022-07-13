function insert_code_buttons(arr) {
  
  var elem = document.getElementById('code_buttons');   
  console.log(arr);

  // add a child button for each element in arr
  for (var i = 0; i < arr.length; i++) {
    var showBtn = document.createElement('input');
    showBtn.setAttribute('type', 'button');
    showBtn.setAttribute('class', 'btn btn-primary');
    showBtn.value = arr[i];
    document.getElementById("code_buttons").appendChild(showBtn);
  }
}
