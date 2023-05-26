"use client"

import * as React from "react"
import { Input, TextField, type TextFieldProps } from "@mui/material"

interface DebouncedInputProps extends Omit<TextFieldProps, "onChange"> {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
}

export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: DebouncedInputProps) {
  const [value, setValue] = React.useState(initialValue)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce])

  return (
    <TextField
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}
