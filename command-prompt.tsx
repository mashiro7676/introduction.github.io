'use client'

import React, { useState, useEffect, useRef } from 'react'

export default function Component() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<string[]>(['Welcome to the Command Prompt. Type "help" for a list of commands.'])
  const [currentLine, setCurrentLine] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input)
      setInput('')
    }
  }

  const executeCommand = (cmd: string) => {
    setOutput(prev => [...prev, `> ${cmd}`])
    
    switch (cmd.toLowerCase()) {
      case 'help':
        setOutput(prev => [...prev, 'Available commands: help, clear, echo <message>'])
        break
      case 'clear':
        setOutput([])
        break
      default:
        if (cmd.toLowerCase().startsWith('echo ')) {
          setOutput(prev => [...prev, cmd.slice(5)])
        } else {
          setOutput(prev => [...prev, `Command not recognized: ${cmd}`])
        }
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLine(prev => prev.length < output[output.length - 1].length 
        ? output[output.length - 1].slice(0, prev.length + 1) 
        : prev)
    }, 50)

    return () => clearInterval(timer)
  }, [output])

  return (
    <div className="bg-black text-green-500 p-4 font-mono h-screen overflow-auto">
      {output.slice(0, -1).map((line, index) => (
        <div key={index}>{line}</div>
      ))}
      <div>{currentLine}</div>
      <div className="flex items-center">
        <span>{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="bg-black text-green-500 outline-none border-none ml-2 w-full"
          autoFocus
        />
      </div>
    </div>
  )
}
