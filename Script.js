   //Takes the file input from the from and adds an event listener that triggers a function on chage
   document.querySelector("#images").addEventListener("change", function() {

       //Output for the form which will be emptied upon uploading new files
       var output = document.getElementById("result");
       output.innerHTML = "";

       //For loop for every file uploaded
       for (var i = 0; i < this.files.length; i++) {

           //remembers which file is currently being used
           var file = this.files[i];

           //adding a filereader to read the file object
           const reader = new FileReader();

           //Upon loading the file it will create a div element and put this in the output element as long as the file isn't bigger than the MAX_FILE_SIZE which will return an error
           reader.addEventListener("load", () => {
               var div = document.createElement("div");
               div.classList.add('gif');
               div.innerHTML = "<img src='" + reader.result + "'/>"
               output.insertBefore(div, null);

           });
           reader.readAsDataURL(file);
       }
   });

   //Function to show a gif preview on the webpage using a presigned previewURL
   function previewGIF(previewURL) {
       setTimeout(() => {
           clearOutput(); //clears the entire form

           var alertbox = document.getElementById("alertbox");
           var output = document.getElementById("result");
           output.innerHTML = ""; //makes sure the output field is empty from other images

           //Creates a div element that has the gif attached as image and shows this on the webpage
           var div = document.createElement("div");
           div.innerHTML = "<img src='" + previewURL + "' id='preview'/>"
           output.append(div);

           //In case the gif failed to load it will create an alert and retry in 60 seconds (will only be done once to avoid recursion)
           document.getElementById("preview").onerror = () => {
               var alert = document.createElement("div");
               alert.className = "alert alert-warning alert-dismissible fade show";
               alert.setAttribute("role", "alert");
               alert.setAttribute("id", "alertPreview");
               alert.setAttribute("style", "display: none;");
               alert.innerHTML = '<strong>GIF preview failed to load:</strong> Please wait for the preview to load. (~60 seconds)';
               alertbox.append(alert);
               showFunction("alertPreview");

               setTimeout(() => {
                   output.innerHTML = "";
                   div.innerHTML = "<img src='" + previewURL + "' id='preview'/>"
                   output.append(div);
               }, 30000);
           }
       }, 30000);
   }

   //Function to show an alert automatically
   function showFunction(string) {
       var x = document.getElementById(string);
       if (x.style.display === "none") {
           x.style.display = "block";
           setTimeout(`hideFunction("${string}")`, 30000);
       }
   }

   //Function to hide an allert automatically
   function hideFunction(string) {
       var x = document.getElementById(string);
       if (x.style.display === "block") {
           x.style.display = "none";
       }
   }

   //Function to clear the form
   function clearOutput() {
       document.getElementById("form").reset();
   }

   //Function that sends a file which marks the end of 1 upload session
   async function xhrEND() {
       //in-,outputs and api url
       const API_PRESIGNEDURL = "https://tmgujo0ne5.execute-api.us-east-1.amazonaws.com/default/getPresignedURL";
       let inputApiKey = document.getElementById("apiKey").value;
       let email = document.getElementById("email").value;
       var uploadURL;

       //textfile will be send as type image with blobdata
       let file = null,
           makeTextFile = function(text) {
               let binary = atob(text.split(',')[1])
               let array = []
               for (var i = 0; i < binary.length; i++) {
                   array.push(binary.charCodeAt(i))
               }

               //Transforms files into a blob that can be uploaded as image type
               let data = new Blob([new Uint8Array(array)], {
                   type: 'image'
               })

               file = data
               return file;
           }
           //call the api with the necessary headers and assigns a content type manually
       const response = await fetch(API_PRESIGNEDURL, {
               method: 'GET',
               headers: {
                   'X-Api-Key': inputApiKey,
                   'trigger': 'EndOfUpload',
                   'X-Content-Type-Options': 'nosniff',
                   'Content-Type': 'image',
                   'metadata': email //Uploaded image will have email in metadata tag
               },
           })
           .then(result => result.json())
           .then((output) => {
               uploadURL = output.uploadURL; //saves the presigned url
           })

       //calls the function to make the text file
       makeTextFile("This,file,marks,the,end,of,an,upload")

       //xhr request to upload this file
       const xhrEND = new XMLHttpRequest();
       xhrEND.open('PUT', uploadURL);
       xhrEND.send(file);
   }

   //Adds an event listener to the form, upon submit it will trigger a function
   document.querySelector("#form").addEventListener("submit", function(e) {
       e.preventDefault(); //Prevents the default behaviour from happening upon submitting the form like refreshing the page. 

       //Checks if form is empty -> if empty shows an alert and exits the eventlistener.
       if (document.forms["form"]['images'].value == "") {
           alert("Please select the images you want to upload.");
           return false;
       } else {
           const API_PRESIGNEDURL = "https://tmgujo0ne5.execute-api.us-east-1.amazonaws.com/default/getPresignedURL"; //API URL for the presignedurl
           const API_PREVIEWGIF = "https://zh2yumty2f.execute-api.us-east-1.amazonaws.com/default/getPreviewGif"; //API url to get the gif
           let inputApiKey = document.getElementById("apiKey").value; //API key that validates if the user may access the API
           let email = document.getElementById("email").value; //User email to retrieve GIF
           const data = document.querySelector("#images"); //Loads in all the uploaded files

           //For loop for every file uploaded
           for (var i = 0; i < data.files.length; i++) {

               //checks if there's a file present, then on the given index and finally if it matches the supported image files.
               if (data.files && data.files[i] && data.files[i].name.match(/\.(jpg|jpeg|png|gif)$/)) {

                   //remembers which file is currently being used
                   var file = data.files[i];

                   //adding a filereader to read the file object
                   const reader = new FileReader();

                   //Defines the variable for the uploadURL which will be used later as well as the previewURL
                   var uploadURL;
                   var previewURL;

                   //Event listener that triggers a method on load
                   reader.addEventListener("load", () => {

                       //API GET with the APIKEY as header to request access upon successful completion it will trigger the xhr() funtion
                       const response = fetch(API_PRESIGNEDURL, {
                               method: 'GET',
                               headers: {
                                   'X-Api-Key': inputApiKey,
                                   'metadata': email //Uploaded image will have email in metadata tag to retrieve correct images and gif
                               },
                           })
                           .then(result => result.json())
                           .then((output) => {
                               uploadURL = output.uploadURL; //gets the presigned url
                               xhr();
                           })

                       //Splits the datafile to be inputted in an array at the given index
                       let binary = atob(reader.result.split(',')[1])
                       let array = []
                       for (var i = 0; i < binary.length; i++) {
                           array.push(binary.charCodeAt(i))
                       }

                       //Transforms files into a blob that can be uploaded as image type
                       let blobData = new Blob([new Uint8Array(array)], {
                           type: 'image'
                       })

                       //Makes a PUT request at the uploadURL with the blobdata
                       function xhr() {
                           const xhr = new XMLHttpRequest();
                           xhr.open('PUT', uploadURL);
                           xhr.send(blobData);
                           showFunction("alert");
                       }
                   });
                   reader.readAsDataURL(file); //filereader
               } else {
                   //alert in case the file is of an unsuported type or if the index was out of bounds.
                   alert('Unsuported image file sent: ' + data.files[i].name + '\nThis item was removed from the upload list.\nSupported files: .jpg .jpeg .png .gif')
               }
           }
           //gets the presignedurl for the gif and sends this to the previewgif function.
           const responsePreview = fetch(API_PREVIEWGIF, {
                   method: 'GET',
                   headers: {
                       'metadata': email
                   },
               })
               .then(result => result.json())
               .then((output) => {
                   previewURL = output.previewURL;
                   previewGIF(previewURL);
               })
           xhrEND() //end of upload sesion -> send file to mark this
       }
   });