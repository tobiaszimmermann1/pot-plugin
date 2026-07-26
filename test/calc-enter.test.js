import React from "react"
import ReactDOM from "react-dom"
import { act } from "react-dom/test-utils"
import { Dialog, DialogContent, TextField } from "@mui/material"

test("Enter keydown on input inside MUI Dialog reaches TextField onKeyDown", () => {
  const container = document.createElement("div")
  document.body.appendChild(container)
  const spy = jest.fn()

  act(() => {
    ReactDOM.render(
      <Dialog open>
        <DialogContent>
          <TextField type="number" label="Gewicht" onKeyDown={e => e.key === "Enter" && spy()} />
        </DialogContent>
      </Dialog>,
      container
    )
  })

  const input = document.querySelector("input")
  act(() => {
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
  })

  expect(spy).toHaveBeenCalled()
})
