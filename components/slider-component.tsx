import {
  Box,
  Slider,
  SliderMark,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import { useState } from "react";

export function SliderFrequency() {
  const [sliderValue, setSliderValue] = useState(50);

  const labelStyles = {
    mt: "2",
    ml: "-2.5",
    fontSize: "sm",
  };

  return (
    <Box pt={6} pb={2}>
      <Slider
        aria-label="slider-ex-6"
        defaultValue={1}
        min={0}
        max={24}
        step={6}
        onChange={(val) => setSliderValue(val)}
      >
        {[0, 6, 12, 18, 24].map((e) => (
          <SliderMark key={e} value={e} {...labelStyles}>
            {e}h
          </SliderMark>
        ))}
        {/* <SliderMark
          value={sliderValue}
          textAlign="center"
          bg="blue.500"
          color="white"
          mt="-10"
          ml="-5"
          w="12"
        >
          {sliderValue}h
        </SliderMark> */}
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </Box>
  );
}
