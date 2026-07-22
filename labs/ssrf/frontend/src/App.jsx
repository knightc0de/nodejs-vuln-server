import React, { useState, useRef } from 'react'
import confetti from 'canvas-confetti'
import './app.css'

const App = () => {
  const [response, setResponse] = useState('')
  const formRef = useRef(null)

  const checkStock = async (e) => {
    e.preventDefault()
    setResponse('Loading...')
    
    const formEl = formRef.current
    const currentMethod = formEl.getAttribute('method')
    const selectEl = formEl.querySelector('select[name="stockApi"]')
    const currentUrl = selectEl.value

    try {
      const options = {
        method: currentMethod
      }

      if (currentMethod.toUpperCase() === 'POST') {
        options.headers = { 'Content-Type': 'application/json' }
      }

      const res = await fetch(currentUrl, options)
      const text = await res.text()
      try {
          const data = JSON.parse(text)
          if (data.success === true) {
              confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 }
              })
              setResponse('Success')
          } 
          else if (data.count !== undefined) {
              setResponse(data.count.toString())
          }
          else if (data.message) {
              setResponse(data.message)
          }
          else {
              setResponse('unknown data format')
          }
      } catch {
          setResponse(text)
      }
    } catch (error) {
      setResponse(`Connection Error: ${error.message}`)
    }
  }

  return (
    <>
      <div className="sys-nav"></div>
      <div className="terminal-wrapper">
        <h1>Inventory system</h1>
        <div className="query-box">
          <form id="stockCheckForm" ref={formRef} action="/api/stock" method="POST" onSubmit={checkStock}>
            <label>Target Item</label>
            
            <select name="stockApi" className="item-select">
              <option value="http://localhost:8080/api/stock/phone">Phone</option>
              <option value="http://localhost:8080/api/stock/tablet">Tablet</option>
              <option value="http://localhost:8080/api/stock/usb">USB</option>
              <option value="http://localhost:8080/api/stock/tv">TV</option>
            </select>

            <button type="submit" className="action-btn">
              Execute Query
            </button>
          </form>
        </div>

        {response && (
          <div className="data-output">
            <pre>{response}</pre>
          </div>
        )}
      </div>
    </>
  )
}

export default App
