import * as React from "react"
import Checkbox, { type CheckboxProps } from "@mui/material/Checkbox"

interface ControlledCheckboxProps extends CheckboxProps {
  onCheckedChange?: (checked: boolean) => void
}

export function ControlledCheckbox(props: ControlledCheckboxProps) {
  const [checked, setChecked] = React.useState(props.checked ?? false)

  return (
    <Checkbox
      checked={checked}
      onChange={() => {
        setChecked(!checked)
        props.onCheckedChange?.(!checked)
      }}
      inputProps={{ "aria-label": "controlled" }}
    />
  )
}
