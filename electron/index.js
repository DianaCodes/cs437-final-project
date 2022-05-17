
var server_port = 65482;
var server_addr = "10.0.0.10";   // the IP address of your Raspberry PI

var audioElement = document.getElementsByClassName("audio-element")[0];
var audioElementSource = document.getElementsByClassName("audio-element")[0].getElementsByTagName("source")[0];

var recordButton = document.getElementsByClassName('btn-mic1')[0];
var stopButton = document.getElementsByClassName('btn-mic2')[0];
var cancelButton = document.getElementsByClassName('btn-mic3')[0];

stopButton.disabled = true;
cancelButton.disabled = true;

function client(param){
    const net = require('net');
    
    const client = net.createConnection({ port: server_port, host: server_addr }, () => {
        // 'connect' listener.
        console.log('connected to server!');
        // send the message
        //client.write(`${input}\r\n`);
        client.write(param);
    });
    
    // get the data from the server
    client.on('data', (data) => {
        // data = decodeURIComponent(data);
        // data = data.split(',');
        // console.log(data);
        // document.getElementById("bluetooth").innerHTML = data[2];
        client.end();
        client.destroy();
    });

    client.on('end', () => {
        console.log('disconnected from server');
    });
}

function savePicture(){
}

function startRecording(){
}

function stopRecording(){
}

// Audio code is from https://ralzohairi.medium.com/audio-recording-in-javascript-96eed45b75ee
//API to handle audio recording
var audioRecorder = {
    /** Stores the recorded audio as Blob objects of audio data as the recording continues*/
    audioBlobs: [], /*of type Blob[]*/
    /** Stores the reference of the MediaRecorder instance that handles the MediaStream when recording starts*/
    mediaRecorder: null, /*of type MediaRecorder*/
    /** Stores the reference to the stream currently capturing the audio*/
    streamBeingCaptured: null, /*of type MediaStream*/
    /** Start recording the audio
      * @returns {Promise} - returns a promise that resolves if audio recording successfully started
      */
    start: function () {
            //Feature Detection
            if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
                //Feature is not supported in browser
                //return a custom error
                return Promise.reject(new Error('mediaDevices API or getUserMedia method is not supported in this browser.'));
            }
            else {
                //Feature is supported in browser
                 
                //create an audio stream
                return navigator.mediaDevices.getUserMedia({ audio: true }/*of type MediaStreamConstraints*/)
                    //returns a promise that resolves to the audio stream
                    .then(stream /*of type MediaStream*/ => {
                         
                        //save the reference of the stream to be able to stop it when necessary
                         audioRecorder.streamBeingCaptured = stream;
 
                        //create a media recorder instance by passing that stream into the MediaRecorder constructor
                        audioRecorder.mediaRecorder = new MediaRecorder(stream); /*the MediaRecorder interface of the MediaStream Recording
                        API provides functionality to easily record media*/
 
                        //clear previously saved audio Blobs, if any
                        audioRecorder.audioBlobs = [];
 
                        //add a dataavailable event listener in order to store the audio data Blobs when recording
                        audioRecorder.mediaRecorder.addEventListener("dataavailable", event => {
                            //store audio Blob object
                            audioRecorder.audioBlobs.push(event.data);
                        });
 
                        //start the recording by calling the start method on the media recorder
                        audioRecorder.mediaRecorder.start();
                });
 
            /* errors are not handled in the API because if its handled and the promise is chained, the .then after the catch will be executed*/
            }
    },
    /** Stop the started audio recording
      * @returns {Promise} - returns a promise that resolves to the audio as a blob file
      */
    stop: function () {
         //return a promise that would return the blob or URL of the recording
         return new Promise(resolve => {
            //save audio type to pass to set the Blob type
            let mimeType = audioRecorder.mediaRecorder.mimeType;
 
            //listen to the stop event in order to create & return a single Blob object
            audioRecorder.mediaRecorder.addEventListener("stop", () => {
                //create a single blob object, as we might have gathered a few Blob objects that needs to be joined as one
                let audioBlob = new Blob(audioRecorder.audioBlobs, { type: mimeType });
 
                //resolve promise with the single audio blob representing the recorded audio
                resolve(audioBlob);
            });
 
        //stop the recording feature
        audioRecorder.mediaRecorder.stop();
 
        //stop all the tracks on the active stream in order to stop the stream
        audioRecorder.stopStream();
 
        //reset API properties for next recording
        audioRecorder.resetRecordingProperties();
        });
    },
    /** Stop all the tracks on the active stream in order to stop the stream and remove
     * the red flashing dot showing in the tab
     */
    stopStream: function() {
        //stopping the capturing request by stopping all the tracks on the active stream
        audioRecorder.streamBeingCaptured.getTracks() //get all tracks from the stream
                .forEach(track /*of type MediaStreamTrack*/ => track.stop()); //stop each one
    },
    /** Reset all the recording properties including the media recorder and stream being captured*/
    resetRecordingProperties: function () {
        audioRecorder.mediaRecorder = null;
        audioRecorder.streamBeingCaptured = null;
 
        /*No need to remove event listeners attached to mediaRecorder as
        If a DOM element which is removed is reference-free (no references pointing to it), the element itself is picked
        up by the garbage collector as well as any event handlers/listeners associated with it.
        getEventListeners(audioRecorder.mediaRecorder) will return an empty array of events.*/
    },
    /** Cancel audio recording*/
    /** Cancel audio recording*/
    cancel: function () {
        //stop the recording feature
        audioRecorder.mediaRecorder.stop();
 
        //stop all the tracks on the active stream in order to stop the stream
        audioRecorder.stopStream();
 
        //reset API properties for next recording
        audioRecorder.resetRecordingProperties();
    }
}
 
/** Starts the audio recording*/
function startAudioRecording() {
    recordButton.disabled = true;
    stopButton.disabled = false;
    cancelButton.disabled = false;

    //start recording using the audio recording API
    audioRecorder.start()
        .then(() => { //on success
            console.log("Recording Audio...")    
        })    
        .catch(error => { //on error
            //No Browser Support Error
            if (error.message.includes("mediaDevices API or getUserMedia method is not supported in this browser.")) {       
                console.log("To record audio, use browsers like Chrome and Firefox.");
            }
        });
}

function stopAudioRecording() {
    console.log("Stopping Audio Recording...")

    //stop the recording using the audio recording API
    audioRecorder.stop()
        .then(audioAsblob => { //stopping makes promise resolves to the blob file of the recorded audio
            console.log("stopped with audio Blob:", audioAsblob);

            client(audioAsblob);

            //playAudio(audioAsblob);
        })
        .catch(error => {
            //Error handling structure
            switch (error.name) {
                case 'InvalidStateError': //error from the MediaRecorder.stop
                    console.log("An InvalidStateError has occured.");
                    break;
                default:
                    console.log("An error occured with the error name " + error.name);
            };

        });
    recordButton.disabled = false;
    stopButton.disabled = true;
    cancelButton.disabled = true;
}

function cancelAudioRecording() {
    console.log("Canceling audio...");

    //cancel the recording using the audio recording API
    audioRecorder.cancel();

    recordButton.disabled = false;
    stopButton.disabled = true;
    cancelButton.disabled = true;
}

function createSourceForAudioElement() {
    let sourceElement = document.createElement("source");
    audioElement.appendChild(sourceElement);

    audioElementSource = sourceElement;
}

/** Plays recorded audio using the audio element in the HTML document
 * @param {Blob} recorderAudioAsBlob - recorded audio as a Blob Object 
*/
function playAudio(recorderAudioAsBlob) {

    //read content of files (Blobs) asynchronously
    let reader = new FileReader();

    //once content has been read
    reader.onload = (e) => {
        //store the base64 URL that represents the URL of the recording audio
        let base64URL = e.target.result;

        //If this is the first audio playing, create a source element
        //as pre populating the HTML with a source of empty src causes error
        if (!audioElementSource) //if its not defined create it (happens first time only)
            createSourceForAudioElement();

        //set the audio element's source using the base64 URL
        audioElementSource.src = base64URL;

        //set the type of the audio element based on the recorded audio's Blob type
        let BlobType = recorderAudioAsBlob.type.includes(";") ?
            recorderAudioAsBlob.type.substr(0, recorderAudioAsBlob.type.indexOf(';')) : recorderAudioAsBlob.type;
        audioElementSource.type = BlobType

        //call the load method as it is used to update the audio element after changing the source or other settings
        audioElement.load();

        //play the audio after successfully setting new src and type that corresponds to the recorded audio
        console.log("Playing audio...");
        audioElement.play();
    };

    //read content and convert it to a URL (base64)
    reader.readAsDataURL(recorderAudioAsBlob);
}