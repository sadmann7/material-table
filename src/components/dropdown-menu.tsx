import * as React from "react"
import { Button, Fade, Menu, MenuItem } from "@mui/material"

interface DropdownMenuProps {
  title?: string
  buttonChildren: React.ReactNode
  items: {
    label: string
    onClick?: () => void
  }[]
}

export function DropdownMenu({
  title,
  buttonChildren,
  items,
}: DropdownMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <div>
      <Button
        id="fade-button"
        aria-label="Open menu"
        aria-controls={open ? "fade-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        {buttonChildren}
      </Button>
      <Menu
        id="fade-menu"
        MenuListProps={{
          "aria-labelledby": "fade-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        {title && <MenuItem disabled>{title}</MenuItem>}
        {items.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => {
              handleClose()
              item.onClick?.()
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}
