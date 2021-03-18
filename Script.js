    //Takes the file input from the from and adds an event listener that triggers a function on chage
    document.querySelector("#images").addEventListener("change", function() {
        const MAX_SIZE = 1000000; //Max file size in bits

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
                if (reader.result.length < MAX_SIZE) {
                    div.innerHTML = "<img src='" + reader.result + "'/>"
                    output.insertBefore(div, null);
                } else {
                    alert("File size is too large")
                }
            });
            reader.readAsDataURL(file);
        }
    });

    //Adds an event listener to the form, upon submit it will trigger a function
    document.querySelector("#form").addEventListener("submit", function(e) {
        e.preventDefault(); //Prevents the default behaviour from happening upon submitting the form like refreshing the page. 
        const API_PRESIGNEDURL = "https://tmgujo0ne5.execute-api.us-east-1.amazonaws.com/default/getPresignedURL"; //API URL for the presignedurl
        const API_GIFMAKER = "https://msw31oj97f.execute-api.eu-west-1.amazonaws.com/Prod/generate/gif" //API URL for the generate gif api
        let inputApiKey = document.getElementById("apiKey").value; //API key that validates if the user may access the API
        let email = document.getElementById("email").value; //User email to retrieve GIF
        const data = document.querySelector("#images"); //Loads in all the uploaded files

        //For loop for every file uploaded
        for (var i = 0; i < data.files.length; i++) {

            //remembers which file is currently being used
            var file = data.files[i];

            //adding a filereader to read the file object
            const reader = new FileReader();

            //Defines the variable for the uploadURL which will be used later
            var uploadURL;

            //Event listener that triggers a method on load
            reader.addEventListener("load", () => {

                //API GET with the APIKEY as header to request access upon successful completion it will trigger the xhr() funtion
                const response = fetch(API_PRESIGNEDURL, {
                        method: 'GET',
                        headers: {
                            'X-Api-Key': inputApiKey,
                            'metadata': email //Uploaded image will have email in metadata tag
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
                }

            });
            reader.readAsDataURL(file);
        }

    });
    /*
            //Body with required info for the API to return an image in the given storage URL
            const imageData = {
                "inputImageUrls": [
                    "https://i.pinimg.com/originals/a4/f8/f9/a4f8f91b31d2c63a015ed34ae8c13bbd.jpg",
                    "https://i.pinimg.com/originals/20/79/03/2079033abc8314be554f9d24f562a199.jpg"
                ],
                "outputImageUrl": "http://requestbin.net/r/49szfjx7"
            }

            //Post request with the API key
            fetch(API_GIFMAKER, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'SIdHi3lzwma61h4GeBGR96ZD4rpsa3mb6iKVlMG7'
                    },
                    body: JSON.stringify(imageData)
                })
                .then(response => response.text())
                .then((response) => updateResponse(response))
                .catch(error => console.error(error));
                */