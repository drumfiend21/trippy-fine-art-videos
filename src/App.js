import React, { useEffect, useState } from 'react'
import './App.css'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem'

const steps = [1,2,3]

function App() {
  const [step, setStep] = useState(1)
  const [valid, setValid] = useState(false)
  // const [src, setSrc] = useState('')
  const [departments, setDepartments] = useState([])
  const [departmentId, setDepartmentId] = useState('')

  const [searchString, setSearchString] = useState('')

  const [objectIds, setObjectIds] = useState([])
  const [queryError, setQueryError] = useState(false)
  
  // const [refetch, setRefetch] = useState(true)
  const progressStep = () => {
    let newStep = step
    newStep++
    if (newStep > 3) {
      newStep = 1
    }
    setStep(newStep)
  }

  const decrementStep = () => {
    let newStep = step
    newStep --
    if (newStep < 0) {
      newStep = 0
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

  useEffect(() => {
    if (step === 3) {
      async function fetchData() {
        const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${searchString}
        `).then(res => res.json())
        console.log(response)
        if (response.objectIDs.length > 20) {
          setObjectIds(response.objectIDs)
        } else {
          decrementStep()
          setQueryError(true)
        }
      }
      fetchData()
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
      async function fetchObjects() {
        const promises = []
        objectIds.forEach(oId => {
          promises.push(fetch(``))
        })
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
              {departments.map(d => {
                return (<MenuItem value={d.departmentId}>{d.displayName}</MenuItem>)
              })}
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
        <div className="fadein">
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
