import React, { useEffect, useState, useRef } from 'react'
import './App.css'
import './kal.css'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem'
import Radio from '@material-ui/core/Radio'

const steps = [1,2,3,4]

const images = []

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
  const [step, setStep] = useState(1)
  const [valid, setValid] = useState(false)
  // const [src, setSrc] = useState('')
  const [departments, setDepartments] = useState([])
  const [departmentId, setDepartmentId] = useState('')

  const [searchString, setSearchString] = useState('')

  const [objectIds, setObjectIds] = useState([])
  const [imagesTotal, setImagesTotal] = useState(0)
  const [queryError, setQueryError] = useState(false)

  const [imageCount, setImageCount] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (step === 4) {
      const script = document.createElement('script');
  
      script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js";
      script.async = true;
    
      document.body.appendChild(script);

      const scriptTwo = document.createElement('script');
    
      scriptTwo.src = "kal.js";
      scriptTwo.async = true;
    
      document.body.appendChild(scriptTwo);
    }
  
    // return () => {
    //   document.body.removeChild(script);
    //   document.body.removeChild(scriptTwo);
    // }
  }, [step]);

  useInterval(() => {
    // Your custom logic here
    getImage()
  }, isRunning ? 10000 : null);
  
  // const [refetch, setRefetch] = useState(true)
  const progressStep = () => {
    let newStep = step
    newStep++
    if (newStep > steps[steps.length-1]) {
      newStep = 1
    }
    setStep(newStep)
  }

  const decrementStep = () => {
    let newStep = step
    newStep --
    if (newStep < 1) {
      newStep = 1
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
    if (newCount % 5 === 0 && newCount < imagesTotal) {
      //fetch next batch
      getBatchImages(newCount+5)
    }
    var imageElements = document.getElementsByClassName("image")
    console.log(imageElements)
    for (var i = 0; i < imageElements.length; i++) {
      imageElements[i].style.backgroundImage = [ 'url(', decodeURIComponent( images[newCount] ), ')' ].join( '' );
    }
  }

  useEffect(() => {
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
      { step === 4 &&
        <div className="imageBox">
          {/* <p>{images[imageCount]}</p>
          <img src={images[imageCount]} className='image'/> */}
          <div className='kaleidoscope fadein'></div>
        </div>
      }
      {
        queryError && <p>Not enough art to make a cool video.  Please select a different department and/or search something else.</p>
      }
      <hr />
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
  );
}

export default App;
