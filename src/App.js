import React, { useEffect, useState, useRef } from 'react'
import './App.css'
import './kal.css'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'

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
import { findAllByTestId } from '@testing-library/dom'

const steps = [0, 1,2,3,4]

let images = []

let replayTimer = 0

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

function App() {
  const [step, setStep] = useState(-1)
  const [valid, setValid] = useState(false)
  // const [src, setSrc] = useState('')

  const [colors, setColors] = useState(['#fff', '#fff', '#fff', '#fff'])
  const [lyrics, setLyrics] = useState([])
  const [bpm, setBpm] = useState(10)
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

  const [aud, setAud] = useState(null)
  const [audioPlaying, setAudioPlaying] = useState(false)

  const playAudio = () => {
    aud.play()
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
    var imageElements = document.getElementsByClassName("image")
    for (var i = 0; i < imageElements.length; i++) {
      imageElements[i].style.backgroundImage = [ 'url(', decodeURIComponent( images[newCount] ), ')' ].join( '' );
      imageElements[i].style.animationDuration = delay/1000 + 's'
    }
    if (text || text === '') {
      window.setParticle(text, colors)
    }
    if (!audioPlaying) {
      playAudio()
    }
  }

  useInterval(() => {
    // Your custom logic here
    setStartReplay(false)
    setShowHelper(false)
    getImage()
  }, isRunning ? delay : null);
  
  // const [refetch, setRefetch] = useState(true)

  const startOver = () => {
    setStep(-1)
    setValid(false)

    setColors(['#fff', '#fff', '#fff', '#fff'])
    setLyrics([])
    setBpm(10)
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

    var oldcanv = document.getElementsByTagName('canvas');
    if (oldcanv.length) {
        document.body.removeChild(oldcanv[0])
    }
  }

  const replay = () => {
    setStartReplay(true)
    aud.pause()
    aud.currentTime = 0 
    setAudioPlaying(false)
    setImageCount(0)
  }

  const progressStep = () => {
    let newStep = step
    newStep++
    if (newStep > steps[steps.length-1]) {
      newStep = -1
    }
    setStep(newStep)
  }

  const decrementStep = () => {
    let newStep = step
    newStep --
    if (newStep < -1) {
      newStep = -1
    }
    setStep(newStep)
  }

  const handleDepartmentOnChange = (e) => {
    setValid(true)
    setDepartmentId(e.target.value)
  }

  const handleSearchStringOnChange = (e) => {
    setSearchString(e.target.value)
    setValid(true)
  }

  const handleLyricsText = (e) => {
    const text = e.target.value
    const splitted = text.split('\n\n').filter(s => s !== '')
    setValid(true)
    setLyrics(splitted)
  }

  const handleBpmChange = (e) => {
    const bpm = e.target.value
    const secondsPerBeat = 60/bpm
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
      const aud = new Audio(str)
      setAud(aud)
    }
    reader.readAsDataURL(f.files[0])
  }

  useEffect(() => {
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

      const scriptThree = document.createElement('script');
    
      scriptThree.src = "particle.js";
      scriptThree.async = true;
    
      document.body.appendChild(scriptThree); 
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
    }
    if (step === 4) {
      setIsRunning(true)
      setStartReplay(true)
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
  
  return (
    <>
      { step === -1 &&
        <div>
          <p>Enter your lyrics.  Separate them with new paragraphs for each 4 bars.  If there are no lyrics for the four bars, enter NA.</p>
          <TextareaAutosize
            rowsMax={200}
            aria-label="maximum height"
            defaultValue=""
            onChange={handleLyricsText}
          />
          <p>Choose four colors for your lyric text animation</p>
          <div className='picker-container'>
            <ChromePicker
              color={ colors[0] }
              onChangeComplete={ (c) => handleColorChange(c, 0) }
            />
            <ChromePicker
              color={ colors[1] }
              onChangeComplete={ (c) => handleColorChange(c, 1) }
            />
            <ChromePicker
              color={ colors[2] }
              onChangeComplete={ (c) => handleColorChange(c, 2) }
            />
            <ChromePicker
              color={ colors[3] }
              onChangeComplete={ (c) => handleColorChange(c, 3) }
            />
          </div>
        </div>
      }
      { step === 0 &&
        <>
          <div>
            <p>Enter BPM</p>
            <TextField id="standard-basic" label="BPM" onChange={handleBpmChange}/>
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
          <TextField id="standard-basic" label="Search string" onChange={handleSearchStringOnChange}/>
        </div>
      }
      { step === 3 &&
        <div>
          {
            !valid && <p>Preparing video...</p> 
          }
          {
            valid && <p>Video ready.  Click continue!</p>
          }
        </div>
      }
      {
        step === 4 &&
        <div className='lyrics-background'/>
      }
      {
        queryError && <p>Not enough art to make a cool video.  Please select a different department and/or search something else.</p>
      }
      <div style={{display: isRunning ? 'block' : 'none'}} className='kaleidoscope fadein'></div>
      {step !==4 && <hr />}
      { step !== 4 && <>
        <Button 
          variant="contained" 
          color="primary" 
          disableElevation
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
          }}
          disabled={!valid}
        >
          Continue
        </Button>
      </>
    }
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
    </>
  );
}

export default App;
