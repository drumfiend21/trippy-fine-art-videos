import React, { useEffect, useState, useRef } from 'react'
import './App.css'
import './kal.css'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'

import { stripHtml } from "string-strip-html"

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import Loader from 'react-loader-spinner'
import Slide from '@material-ui/core/Slide'
import { ChromePicker } from 'react-color'
import { TwitterPicker } from 'react-color'
import { Paper } from '@material-ui/core'

import FineArtLogo from './img/fine-art-logo.png'

const steps = [0, 1,2,3,4]

let images = []

let aud
let recorder
let data = []

function detectMob() {
  const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
  ];

  return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
  });
}

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest function.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const wait = (delayInMS) => {
  return new Promise(resolve => setTimeout(resolve, delayInMS));
}

function App() {
  const [step, setStep] = useState(-2)
  const [valid, setValid] = useState(true)
  // const [src, setSrc] = useState('')

  const [colors, setColors] = useState(['black', 'black', 'black', 'black'])
  const [showColorPicker, setShowColorPicker] = useState(null)
  const [colorPickerType, setShowColorPickerType] = useState(0)
  const [lyrics, setLyrics] = useState([])
  const [bpm, setBpm] = useState(null)
  const [delay, setDelay] = useState(10000)

  const [departments, setDepartments] = useState([])
  const [departmentId, setDepartmentId] = useState('')

  const [searchString, setSearchString] = useState('')

  const [objectIds, setObjectIds] = useState([])
  const [imagesTotal, setImagesTotal] = useState(0)
  const [queryError, setQueryError] = useState(false)

  const [imageCount, setImageCount] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const [startReplay, setStartReplay] = useState(false)

  const [showStepFourOptions, setShowStepFourOptions] = useState(false)

  const [showHelper, setShowHelper] = useState(true)

  // const [aud, setAud] = useState(null)
  const [audioPlaying, setAudioPlaying] = useState(false)

  const [isRecording, setIsRecording] = useState(false)

  const [showDownload, setShowDownload] = useState(false)

  const [imageElements, setImageElements] = useState([])

  const [nextImageDataUrl, setNextImageDataUrl] = useState('')

  var r
  var color = 0

  // const setOverlayColors = () => {
  //   const el = document.getElementById('overlay')
  //   el.style.background = `linear-gradient(270deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[3]}`
  //   el.style.backgroundSize = '400% 400%'
  // }

  function overlayInit() {
    setRandomColor();
    setInterval(function() {
      setRandomColor();
    }, 2000);
  }

  function setRandomColor() {
    const el = document.getElementById('overlay')
    switch (color) {
      case 0:
        el.style.backgroundColor = getSColor(random(1, 4))
        break;
      default:
        el.style.backgroundColor = getSColor(random(1, 4))
        break;
    }
  }

  function random(min, max) {
    var r = Math.round(Math.random() * (max - min) + parseInt(min));
    console.log(r);
    return r;
  }

  function random(min, max, ex) {
    r = Math.round(Math.random() * (max - min) + parseInt(min));
    if (r === ex) r++;
    if (r > max) r = r - 2;
    return r;
  }

  function getSColor(n) {
    switch (n) {
      case 1: color = 1; return colors[0];
      case 2: color = 2; return colors[1];
      case 3: color = 3; return colors[2];
      case 4: color = 4; return colors[3];
    }
  }

  // const clearParticle = () => {
  //   var oldcanv = document.getElementsByTagName('canvas');
  //   if (oldcanv.length) {
  //       document.body.removeChild(oldcanv[0])
  //   }
  // }

  // const fetchAsBlob = url => fetch(url)
  //   .then(response => response.blob());

  // const convertBlobToBase64 = blob => new Promise((resolve, reject) => {
  //     const reader = new FileReader;
  //     reader.onerror = reject;
  //     reader.onload = () => {
  //         resolve(reader.result);
  //     };
  //     reader.readAsDataURL(blob);
  // });

  // const getBase64Image = async (src) => {
  //   console.log(src)
  //   const newImage = new Image()
  //   // newImage.setAttribute('crossOrigin', 'anonymous')
  //   // newImage.crossOrigin = '*'
  //   newImage.src = src
  //   newImage.onload = function(){
  //     const canvas = document.createElement("canvas");
  //     canvas.width = this.width
  //     canvas.height = this.height
  //     const ctx = canvas.getContext('2d')
  //     ctx.drawImage(newImage, 0, 0)
  //     const dataUrl = canvas.toDataURL("image/png")
  //     console.log(dataUrl)
  //     setNextImageDataUrl(dataUrl)
  //   }

  // //   console.log(src)
  // //   fetchAsBlob(src)
  // //  .then(convertBlobToBase64)
  // //  .then((result) => {
  // //     console.log(result)
  // //     setNextImageDataUrl(result)
  // //   })
  // }

  const startRecording = (stream, lengthInMs) => {
    recorder = new MediaRecorder(stream);
    data = [];

    recorder.ondataavailable = event => data.push(event.data);
    recorder.start();

    let stopped = new Promise((resolve, reject) => {
      recorder.onstop = resolve;
      recorder.onerror = event => reject(event.name);
    });

    let recorded = wait(lengthInMs).then(() => {
      return recorder.state == "recording" && recorder.stop()
    });

    return Promise.all([
      stopped,
      recorded
    ])
    .then(() => data)
  }

  const stop = () => {
    const preview = document.getElementById('preview')

    preview && preview.srcObject && preview.srcObject.getTracks && preview.srcObject.getTracks().forEach(track => track.stop());
    setIsRunning(false)
    setImageCount(0)
    // clearParticle()
    setShowDownload(true)
  }
  
  const recordScreen = () => {
    const preview = document.getElementById('preview')
    const downloadButton = document.getElementById('download')
    navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'never',
        width: 1920,
        height: 1080,
        frameRate: 100
      },
      audio: {
        echoCancellation: false,
        googAutoGainControl: false,
        autoGainControl: false,
        noiseSuppression: false,
        sampleRate: 44100
      }
    }).then(stream => {
      preview.srcObject = stream
      downloadButton.href = stream
      preview.captureStream = preview.captureStream || preview.mozCaptureStream
      return new Promise(resolve => {
        return resolve(preview)
      });
    }).then(() => {
      return startRecording(preview.captureStream(), (aud.duration * 1000) + 7500)
    }).then (recordedChunks => {
      let recordedBlob = new Blob(recordedChunks, { type: "video/webm" })
      downloadButton.href = URL.createObjectURL(recordedBlob)
      downloadButton.download = "LyricVideo.webm"
      stop()
    })
  }

  const playAudio = () => {
    // TODO: remove this line
    // aud.currentTime = 240
    setTimeout(() => {
      aud.play()
    }, 800)
    setAudioPlaying(true)
  }

  const getBatchImages = async (offset) => {
    const promises = []
    objectIds.slice(offset, offset+10).forEach(oId => {
      promises.push(fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${oId}`))
    })
    const responses = await Promise.all(promises).then(responses => {
      return Promise.all(responses.map(res => res.json()))
    })
    responses.map(o => images.push(o.primaryImage))
  }

  const getImage = async () => {
    let newCount = imageCount
    console.log('SETTING IMAGE COUNT: ', newCount)
    newCount ++
    if (newCount > imagesTotal) {
      newCount = 0
    }
    setImageCount(newCount)
    if (newCount % 5 === 0 && newCount % 10 !== 0  && newCount < imagesTotal && newCount + 15 > images.length) {
      //fetch next batch
      getBatchImages(newCount+5)
    }
    const text = lyrics[imageCount] === 'NA' ? '' : lyrics[imageCount]
    // var imageElements = document.getElementsByClassName("image")
    for (var i = 0; i < imageElements.length; i++) {
      const duration = parseFloat(imageElements[i].style.animationDuration)
      const compareDuration = parseFloat((delay/1000).toFixed(5))
      if (duration !== compareDuration) {
        imageElements[i].style.animationDuration = delay/1000 + 's'
      } 
      // if (nextImageDataUrl) {
      //   console.log(nextImageDataUrl)
      //   imageElements[i].style.backgroundImage = [ 'url(', nextImageDataUrl, ')' ].join( '' );
      // } else {
        imageElements[i].style.backgroundImage = [ 'url(', decodeURIComponent( images[newCount] ), ')' ].join( '' );
      // } 
    }
    if (text || text === '') {
      // window.setParticle(text, colors)
    }
    if (!audioPlaying) {
      playAudio()
    }
    // load up next image
    // getBase64Image(images[imageCount+1])
  }

  useInterval(() => {
    // Your custom logic here
    setStartReplay(false)
    setShowHelper(false)
    getImage()
  }, isRunning ? delay : null);
  
  // const [refetch, setRefetch] = useState(true)

  const startOver = () => {
    setStep(-2)
    setValid(false)

    setColors(['black', 'black', 'black', 'black'])
    setLyrics([])
    setBpm(null)
    setDelay(10000)

    setDepartments([])
    setDepartmentId('')

    setSearchString('')

    setObjectIds([])
    setImagesTotal(0)
    setQueryError(false)

    setImageCount(0)
    setIsRunning(false)
    images = []

    aud.pause()
    aud = null
    setAudioPlaying(false)

    stop()
    setShowDownload(false)
    setIsRecording(false)

    // clearParticle()
  }

  const replay = () => {
    setStartReplay(true)
    aud.pause()
    aud.currentTime = 0 
    setAudioPlaying(false)
    setImageCount(0)
    stop()
    setShowDownload(false)
    const isMobile = detectMob()
    if (!isMobile) {
      recordScreen()
    }
    setIsRunning(true)
  }

  const progressStep = () => {
    let newStep = step
    newStep++
    if (newStep > steps[steps.length-1]) {
      newStep = steps.length-1
    }
    setStep(newStep)
  }

  const decrementStep = () => {
    let newStep = step
    newStep --
    if (newStep < -2) {
      newStep = -2
    }
    setStep(newStep)
  }

  const handleDepartmentOnChange = (e) => {
    setValid(true)
    setDepartmentId(e.target.value)
  }

  const handleSearchStringOnChange = (e) => {
    const sanitized = stripHtml(e.target.value).result
    setSearchString(sanitized)
    setValid(true)
  }

  const handleLyricsText = (e) => {
    const text = e.target.value
    const sanitized= stripHtml(text).result
    const splitted = sanitized.split('\n\n').filter(s => s !== '')
    setValid(true)
    setLyrics(splitted)
  }

  const handleBpmChange = (e) => {
    const newBpm = e.target.value
    const sanitized = stripHtml(newBpm).result
    const number = parseFloat(sanitized)
    if (isNaN(number) || typeof number !== 'number') {
      setValid(false)
      return setBpm(null)
    }
    setBpm(sanitized)
    const secondsPerBeat = 60/sanitized
    const secondsPerBar = secondsPerBeat * 4
    const secondsPerFourBars = secondsPerBar * 4
    setDelay(secondsPerFourBars * 1000)
    setValid(true)
  }

  const handleColorChange = (color, index) => {
    const newColors = colors
    newColors[index] = color.hex
    setColors(newColors)
  }

  const getAudio = (e) => {
    var f = document.getElementById('song')
    const reader = new FileReader();
    reader.onload = function(){
      var str = this.result
      aud = new Audio(str)
    }
    reader.readAsDataURL(f.files[0])
  }

  const handleShowColorPicker = (i) => {
    if(showColorPicker === i) {
      setShowColorPicker(null)
    } else {
      setShowColorPicker(i)
    }
  }

  useEffect(() => {
    if (step === -2) {
      setValid(true)
    }
    
    if (step === 0) {
      var head  = document.getElementsByTagName('head')[0];
      var link  = document.createElement('link');
      link.rel  = 'stylesheet';
      link.type = 'text/css';
      link.href = 'https://fonts.googleapis.com/css?family=Montserrat:200,300,400,600';
      link.media = 'all';
      head.appendChild(link);

      const script = document.createElement('script');
  
      script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js";
      script.async = true;
    
      document.body.appendChild(script);

      const scriptTwo = document.createElement('script');
    
      scriptTwo.src = "kal.js";
      scriptTwo.async = true;
    
      document.body.appendChild(scriptTwo);

      // const scriptThree = document.createElement('script');
    
      // scriptThree.src = "particle.js";
      // scriptThree.async = true;
    
      // document.body.appendChild(scriptThree); 
    }
    if (step === 3) {
      async function fetchData() {
        //&hasImages=true${departmentId ? '&departmentId=' + departmentId : ''}
        const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${searchString}`).then(res => res.json())
        if (response.objectIDs.length > 20) {
          setObjectIds(response.objectIDs)
          setImagesTotal(parseInt(response.total))
        } else {
          decrementStep()
          setQueryError(true)
        }
      }
      fetchData()
      // setOverlayColors()
    }
    if (step === 4) {
      setIsRunning(true)
      setStartReplay(true)
      setImageElements(document.getElementsByClassName('image'))
      // overlayInit()
      if (!isRecording) {
        setIsRecording(true)
        const isMobile = detectMob()
        if (!isMobile) {
          recordScreen()
        }
      }
    }
  }, [step])
  
  useEffect(() => {
    async function fetchData() {
        const response = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/departments').then(res => res.json())
        setDepartments(response.departments)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (objectIds.length) {
      setValid(false)
      async function fetchObjects() {
        await getBatchImages(0)
        setValid(true)
      }
      fetchObjects()
    }
  }, [objectIds])

  useEffect(() => {
    if (window.screen.width < 750) {
      setShowColorPickerType(1)
    } else {
      setShowColorPickerType(0)
    }
  }, [window.screen.width])

  const lyric = lyrics[imageCount - 1] === 'NA' ? '' : lyrics[imageCount-1]

  const useTextColor = colors.filter(c => c !== 'black').length > 0

  let pTop = 44
  
  return (<>
    { step !== 4 && <div className='container'>
      <Paper elevation='10' className="container-paper">
        {/* <img className='fine-art-logo' src={FineArtLogo} /> */}
        <div class="logo">
          <b>F<span>in</span>e <span>A</span>rt <span>Vi</span>d<span>eos</span></b>
        </div>
        {
          step === -2 && <div className='greeting'>
            {/* <Paper elevation={0}> */}
              {/* <h1>Fine Art Music Video Generator</h1> */}
              <p>As a musician, I wanted an easy way to make interesting music videos.</p>
              <p>This is a simple app I created that will let you do just that.</p>
              <p>This generator draws on art from the Metropolitan Museum of Art and creates hypnotic kaleidoscopic imagery.</p>
              <p>All synced to your mp3 and lyrics.</p>
              <p>Enjoy,</p>
              <p>Mowgli Lion</p>
              <a href='http://www.jungleej.wordpress.com'>Mowgli Music</a>
            {/* </Paper> */}
          </div> 
        }
        { step === -1 &&
          <div>
            <p>Enter your lyrics.  Separate them with new paragraphs for each 4 bars.  If there are no lyrics for the four bars, enter NA.</p>
            <TextareaAutosize
              rowsMax={12}
              rows={12}
              aria-label="maximum height"
              defaultValue=""
              onChange={handleLyricsText}
              className='text-area'
            />
            <p>Choose four colors for your lyric text animation.  Otherwise text will be black.</p>
            <div className='picker-container'>
              {
              colors.map((c,i) => {
                return (
                  <>
                    <Button 
                      onClick={() => handleShowColorPicker(i)} 
                      variant="contained" 
                      color="primary" 
                      disableElevation
                      style={{backgroundColor: colors[i], border: '5px solid white'}}
                    >
                      <p>{i+1}</p>
                    </Button>
                    {
                      colorPickerType === 0 && 
                      <Slide direction="right" in={showColorPicker === i} mountOnEnter unmountOnExit>
                        <ChromePicker
                            color={ colors[i] }
                            onChangeComplete={ (c) => {
                              handleColorChange(c, i)
                            } }
                          />
                      </Slide>
                    }
                    {
                      colorPickerType === 1 && 
                      <Slide direction="right" in={showColorPicker === i} mountOnEnter unmountOnExit>
                        <TwitterPicker
                          color={ colors[i] }
                          onChangeComplete={ (c) => {
                            handleColorChange(c, i)
                          } }
                        />
                      </Slide>
                    }
                  </>
                )
              })}
            </div>
          </div>
        }
        { step === 0 &&
          <>
            <div>
              <p>Enter BPM</p>
              {/* <TextareaAutosize
                rowsMax={1}
                rows={1}
                aria-label="maximum height"
                value={bpm}
                onChange={handleBpmChange}
              /> */}
              <div className='text-field-wrapper'>
                <TextField inputProps={{backgroundColor: 'white'}} type='number' value={bpm} id="standard-basic" label="BPM" onChange={handleBpmChange}/>
              </div>
            </div>
            <div>
              <p>Upload your MP3</p>
              <input id="song" type="file" accept=".mp3" onChange={getAudio}/>
            </div>
          </>
        }
        { step === 1 &&
          <div>
            <p>Choose an art department from the MET</p>
            <FormControl className='formControl'>
              <InputLabel id="demo-simple-select-label">Department</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={departmentId}
                onChange={handleDepartmentOnChange}
              >
                <MenuItem value={null}>ALL DEPARTMENTS</MenuItem>
                {/* {departments.map(d => {
                  return (<MenuItem value={d.departmentId}>{d.displayName}</MenuItem>)
                })} */}
              </Select>
            </FormControl>
          </div>
        }
        { step === 2 &&
          <div>
            <p>Enter a search string</p>
            <div className='text-field-wrapper'>
              <TextField color='primary' id="standard-basic" label="Search string" onChange={handleSearchStringOnChange}/>
            </div>
          </div>
        }
        { step === 3 &&
          <div>
            {
              !valid && <p>Preparing video...</p> 
            }
            {
              valid && <>
                <p>Video ready.  Click continue!</p>
                <p>If you are on a desktop browser, you will be prompted to share your screen.</p>
                <p>This will record the video and audio and allow you to download at the end.</p>
                <p>Select your browser tab and select "share audio".</p>
                <p>If you don't want the download, just click cancel.</p>
              </>
            }
          </div>
        }
        {
          queryError && <p>Not enough art to make a cool video.  Please select a different department and/or search something else.</p>
        }
        
        {/* <div id='overlay' style={{display: isRunning ? 'block' : 'none'}}></div> */}
        { step !== 4 && <div className='footer'>
          {/* <hr /> */}
          <div className='menu-button-container'>
            <Button 
              variant="contained" 
              color="primary" 
              disableElevation
              disabled={step === -2}
              onClick={() => {
                decrementStep()
                setValid(false)
                setQueryError(false)
              }}
            >
              Go back
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              disableElevation
              onClick={() => {
                progressStep()
                setValid(false)
                setQueryError(false)
                if (step === 3 && !audioPlaying) {
                    aud && aud.play()
                    aud && aud.pause()
                    aud.currentTime = 0
                }
              }}
              disabled={!valid}
            >
              Continue
            </Button>
          </div>
        </div>
      }
      </Paper>
    </div>
    }
    {
        step === 4 && lyric && imageCount > -1 &&
        <>
          <div className='lyrics-background' />
          { 
            lyric && lyric.split('\n').map(t => {
              pTop+=7.5
              return (
                <>
                  <p style={{top: pTop + '%', backgroundImage: `linear-gradient(270deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[3]}`}} className='lyrics'>{t}</p>
                  { useTextColor ? (
                    <>
                      <p style={{top: pTop + '%'}} className='lyrics-shadow-top'>{t}</p>
                      <p style={{top: pTop + '%'}} className='lyrics-shadow-bottom'>{t}</p>
                    </>
                  ) : null
                  }
                </>
              )
            }) 
          }
        </>
      }
    <div style={{display: isRunning ? 'block' : 'none'}} className='kaleidoscope fadein'></div>
    {
      step === 4 && showHelper && <div className='helper-container'>
        <p>Hover Here for Options</p>
      </div>
    }
    { step === 4 && 
    <div 
      className='hover-options' 
      onMouseLeave={() => setShowStepFourOptions(false)} 
      onMouseEnter={() => setShowStepFourOptions(true)}
      onTouchStart={(e) => {
        if (showStepFourOptions) {
          setShowStepFourOptions(false)
        } else {
          setShowStepFourOptions(true)
        }
      }}
    >
      <Slide direction="down" in={showStepFourOptions} mountOnEnter unmountOnExit>
        <div className='hover-buttons-container'>
          <Button 
            variant="contained" 
            color="primary" 
            disableElevation
            onClick={startOver}
          >
            Start Over
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            disableElevation
            onClick={replay}
          >
            Replay
          </Button>
          {/* <Button 
            variant="contained" 
            color="primary" 
            disableElevation
            onClick={stop}
          >
            Stop Recording
          </Button> */}
        </div>
      </Slide>
    </div>
    }
    {
      startReplay &&
      <div className='replay-countdown'>
        <Loader
          type="ThreeDots"
          color="white"
          height={100}
          width={100}
          timeout={100000} //3 secs
        />
      </div>
    } 
    {
      step === 4 && <video style={{display: 'none'}} id="preview" width="160" height="120" autoplay muted />
    }
    {
      step === 4 &&
        <a 
          style={{display: showDownload ? 'block' : 'none'}}
          id="download"
          className='button'
        >
          Download
        </a>
    }
  </>
  );
}

export default App;
