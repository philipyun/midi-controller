interface AllMIDIDevices {
  inputs: WebMidi.MIDIInput[];
  outputs: WebMidi.MIDIOutput[];
}

export const requestMIDI = async (): Promise<AllMIDIDevices> => {
  const access = await navigator.requestMIDIAccess();
  return {
    inputs: Array.from(access.inputs.values()),
    outputs: Array.from(access.outputs.values()),
  };
};
