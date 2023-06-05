import * as React from "react"
import { Button, Popover } from "@mui/material"

interface ControlledPopoverProps {
  buttonChildren: React.ReactNode
  menuContent: React.ReactNode
}

export function ControlledPopover({
  buttonChildren,
  menuContent,
}: ControlledPopoverProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? "simple-popover" : undefined

  return (
    <div>
      <Button
        aria-describedby={id}
        variant="contained"
        className="bg-blue-500 normal-case text-white hover:bg-blue-600"
        onClick={handleClick}
      >
        {buttonChildren}
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        {menuContent}
      </Popover>
    </div>
  )
}
