import { MidiMessageRx, NoteOnOffMessageRx, parseBaseMidiMessageRx } from './message';
import { requestMIDI } from './permissions';

export class MIDI {
  private inputs: WebMidi.MIDIInput[] | null;
  private outputs: WebMidi.MIDIOutput[] | null;
  private initialized: boolean = false;

  constructor() {
    this.inputs = null;
    this.outputs = null;
    this.initialize();
  }

  private async initialize() {
    const { inputs, outputs } = await requestMIDI();
    this.inputs = inputs;
    this.outputs = outputs;
    this.initialized = true;

    this.listen();
  }

  listen() {
    if (this.inputs === null || !this.initialized) {
      return;
    }

    this.inputs.forEach((input) => {
      input.onmidimessage = (message) => {
        const rawMessage = parseBaseMidiMessageRx(input, message);

        if (rawMessage.type === 'note-on' || rawMessage.type === 'note-off') {
          console.log(new NoteOnOffMessageRx(rawMessage));
        }
      };
    });
  }
}
