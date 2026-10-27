import { useEffect } from "react"
import { Chip, InputAdornment } from "@mui/material"
import ScaleIcon from "@mui/icons-material/Scale"
import { useSmartScale } from "../../contexts/SmartScaleContext"

export function SmartScaleChip({ onApply }) {
  const scale = useSmartScale()

  useEffect(() => {
    if (!scale) return
    scale.subscribe()
    return () => scale.unsubscribe()
  }, [])

  if ( !scale || !scale.isPaired() ) return null

  return (
    <InputAdornment position="end">
      <Chip
        sx={{ width: "100px" }}
        variant="outlined"
        label={`${scale.weightValue} kg`}
        onClick={() => onApply(scale.weightValue)}
        onDelete={() => onApply(scale.weightValue)}
        deleteIcon={<ScaleIcon />}
      />
    </InputAdornment>
  )
}