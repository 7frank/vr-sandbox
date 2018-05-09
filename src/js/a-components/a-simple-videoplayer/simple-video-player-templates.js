export
var styleTemplate = `


    <style type="text/css">
      #video-permission {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: white;
          z-index: 10000;
          display: none;
      }

      #video-permission-button {
        position: fixed;
        top: calc(50% - 1em);
        left: calc(50% - 60px);
        width: 120px;
        height: 2em;
      }
    </style>

 

`;
export
var permissionTemplate = `
    <div id="video-permission">
      <button id="video-permission-button">Allow VR video</button>
    </div>
`;
export
var assetsTemplate = `
      <a-assets>
        <img src="assets/a-simple-videoplayer/play.png" id="play" crossorigin="anonymous">
        <img src="assets/a-simple-videoplayer/pause.png" id="pause" crossorigin="anonymous">
        <img src="assets/a-simple-videoplayer/volume-normal.png" id="volume-normal" crossorigin="anonymous">
        <img src="assets/a-simple-videoplayer/volume-mute.png" id="volume-mute" crossorigin="anonymous">
        <img src="assets/a-simple-videoplayer/seek-back.png" id="seek-back" crossorigin="anonymous">
      </a-assets>

      <a-assets>
        <img src="assets/a-simple-videoplayer/white_grid_thin.png" id="grid" crossorigin="anonymous"> 
      </a-assets>
`;
export
var playerAndControlsTemplate = `
       <video class="video-src" crossorigin="anonymous"></video>
      <!-- MEDIAS HOLDER -->
      <a-sound id="alert-sound" src="src: url(assets/a-simple-videoplayer/action.wav)" autoplay="false" position="0 0 0"></a-sound>
      <a-video id="video-screen" width="8" height="4.5"></a-video>
      <!-- END MEDIAS HOLDER -->

    <a-entity id="controls" position="0 0.5 0">
      <!-- CONTROLS -->
      <a-image id="control-back" width="0.4" height="0.4" src="#seek-back" position="-0.8 0.6 0" visible="false" scale="0.85 0.85 0.85"></a-image>
      <a-image id="control-play" width="0.4" height="0.4" src="#play" position="0 0.6 0"></a-image>
      <a-image id="control-volume" width="0.4" height="0.4" src="#volume-normal" position="0.8 0.6 0" visible="false" scale="0.75 0.75 0.75"></a-image>
      <!-- END CONTROLS -->

      <!-- PROGRESSBAR -->
      <a-entity id="progress-bar" geometry="primitive: plane; width: 4; height: 0.06;"
          material="transparent: true; visible:false; opacity: 0;" position="0 0.1 0">
        <a-plane id="progress-bar-track" width="4" height="0.06" color="black" position="0 0 0.005" opacity="0.2" visible="false"></a-plane>
        <a-plane id="progress-bar-fill" width="0" height="0.06" color="#7198e5" position="-2 0 0.01" visible="false"></a-plane>
      </a-plane>
      <!-- END PROGRESSBAR -->
    </a-entity>   
`;
