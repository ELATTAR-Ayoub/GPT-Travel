'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image';
import ReactMarkdown from 'react-markdown'

// components
import Loader from '@/components/loader';
import SolidSvg from '@/components/SolidSVG';
import ToastMessage from '@/components/Toast';

// styles
import styles from '@/styles/index';

// constants
import {suggestions} from '@/constants'

const Hero = () => {

  const [request, setRequest] = useState<{days?: string, city?: string}>({})
  let [itinerary, setItinerary] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{show: boolean, msg: string, type: string}>({show:false, msg:'', type:'error' })
  const [message, setMessage] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyPopup, setApiKeyPopup] = useState(true);
  

  async function hitAPI() {
    setToast({ show: false, msg: '', type: 'success' });
    try {
      if (!request.city || !request.days) return
      setLoading(true)
      setMessage('Building itinerary...')
      setItinerary('')

      setTimeout(() => {
        if (!loading) return
        setMessage('Getting closer ...')
      }, 7000)

      setTimeout(() => {
        if (!loading) return
        setMessage('Almost there ...')
      }, 15000)
      

      const response = await fetch('/api/get-itinerary', {
        method: 'POST',
        body: JSON.stringify({
          days: request.days,
          city: request.city,
          apiKey : apiKey,
        }),
        timeout: 20000
      } as any)
      const json = await response.json()
      
      const response2 = await fetch('/api/get-points-of-interest', {
        method: 'POST',
        body: JSON.stringify({
          pointsOfInterestPrompt: json.pointsOfInterestPrompt,
          apiKey : apiKey,
        }),
        timeout: 20000
      } as any)
      const json2 = await response2.json()

      let pointsOfInterest = JSON.parse(json2.pointsOfInterest)
      let itinerary = json.itinerary

      pointsOfInterest.map((point:string) => {
        // itinerary = itinerary.replace(point, `<a target="_blank" rel="no-opener" href="https://www.google.com/search?q=${encodeURIComponent(point + ' ' + request.city)}">${point}</a>`)
        itinerary = itinerary.replace(point, `[${point}](https://www.google.com/search?q=${encodeURIComponent(point + ' ' + request.city)})`)
      })

      setItinerary(itinerary)
      setLoading(false)
      setToast({ show: true, msg: 'updated successfully!', type: 'success' });
    } catch (err) {
      console.log('error: ', err)
      setToast({ show: true, msg: 'An error occurred', type: 'error' });
      setMessage('')
    }
  }

  let days = itinerary.split('Day')

  if (days.length > 1) {
    days.shift()
  } else {
    days[0] = "1" + days[0]
  }


  return (
  <section className={`${styles.flexCenter} flex-col gap-8 relative overflow-hidden w-full my-4`} >

    {toast.show && <ToastMessage message={toast.msg} type={'success'} />}



    {apiKeyPopup && <div className={`${styles.flexCenter} fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-screen bg-primary-grey-28 bg-opacity-50 z-30`} >

      <form className={` ${styles.flexCenter} flex-col gap-8 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm overflow-hidden w-64 shadow-md bg-primary-grey-14 p-8`}>
        <h1 className={` text-lg font-bold mb-2 `}>Insert OpenAi API key</h1>

        <label aria-label='City' className={` primary_label_form `}>
            <input required type="text" placeholder='API key' className='search_input' onChange={(e) => setApiKey(e.target.value)} />
        </label>
        <button aria-label="Search bar button" type="button" onClick={() => setApiKeyPopup(false)} className={`w-full rounded p-4 bg-accent-color-77 hover:bg-accent-color-71 text-secondary-white transition-all ${styles.flexCenter}`} >
            Close
        </button>
      </form>
      
    </div>}

    <form onSubmit={hitAPI} className={` relative ${styles.flexBetween} gap-6 flex-col w-full `}>
          <label aria-label='City' className={` primary_label_form `}>
              <input required type="text" placeholder='City' onChange={e => setRequest(request => ({
            ...request, city: e.target.value
          }))} className='search_input'  />
          </label>
          <label aria-label='Days' className={` primary_label_form `}>
              <input required type="number" max={10} min={0} placeholder='Days' onChange={e => setRequest(request => ({
            ...request, days: e.target.value
          }))} className='search_input'  />
          </label>
          
          <button aria-label="Search bar button" type="button" onClick={hitAPI} className={`w-full rounded p-4 bg-accent-color-77 hover:bg-accent-color-71 text-secondary-white transition-all ${styles.flexCenter}`} >
              Get travel journey <SolidSvg width={'24px'} height={'24px'} className={' scale-110'} color={'#fff'} path={'/send.svg'} />
          </button>
    </form>

    <div className={`${styles.flexStart} flex-col gap-8 relative w-full my-4`} >
        {
          loading && (
            <p>{message}</p>
          )
        }
        {
          itinerary && days.map((day, index) => (
            <div
              key={index}
            >
              <ReactMarkdown
              // remarkPlugins={[remarkGfm]}
              components={{
                a: (props:any) => {
                    return <a target="_blank" className='linkHover' rel="no-opener" href={props.href}>{props.children}</a>
                }
            }}
              >
                {`Day ${day}`}
                </ReactMarkdown>
            </div>
          ))
        }
    </div>

    
  </section>
  )
};



export default Hero;
