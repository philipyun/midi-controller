type MidiChannel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;
type MidiMessageRxType =
  | 'note-off'
  | 'note-on'
  | 'polyphonic-key-pressure'
  | 'control-change'
  | 'program-change'
  | 'channel-pressure'
  | 'pitch-bend'
  | 'invalid';

interface RawMidiMessageRx {
  source: WebMidi.MIDIInput;
  channel: MidiChannel;
  type: MidiMessageRxType;
  firstVal: number;
  secondVal: number;
}

export const parseBaseMidiMessageRx = (
  inputDevice: WebMidi.MIDIInput,
  messageEvent: WebMidi.MIDIMessageEvent,
): RawMidiMessageRx => {
  const header = messageEvent.data[0];
  const firstVal = messageEvent.data[1];
  const secondVal = messageEvent.data[2];
  const typeBits = header >> 4;

  let type: MidiMessageRxType = 'invalid';
  switch (typeBits) {
    case 8:
      type = 'note-off';
      break;
    case 9:
      type = 'note-on';
      break;
    case 10:
      type = 'polyphonic-key-pressure';
      break;
    case 11:
      type = 'control-change';
      break;
    case 12:
      type = 'program-change';
      break;
    case 13:
      type = 'channel-pressure';
      break;
    case 14:
      type = 'pitch-bend';
      break;
  }

  return {
    source: inputDevice,
    channel: ((header & 0b1111) + 1) as MidiChannel,
    type,
    firstVal,
    secondVal: secondVal ?? -1,
  };
};

abstract class BaseMidiMessageRx {
  protected channel: MidiChannel;
  protected type: MidiMessageRxType;
  protected source: WebMidi.MIDIInput;

  constructor(rawMessage: RawMidiMessageRx) {
    this.source = rawMessage.source;
    this.type = rawMessage.type;
    this.channel = rawMessage.channel;
  }
}

const NoteMap = {
  0: 'C',
  1: 'C#/Db',
  2: 'D',
  3: 'D#/Eb',
  4: 'E',
  5: 'F',
  6: 'F#/Gb',
  7: 'G',
  8: 'G#/Ab',
  9: 'A',
  10: 'A#/Bb',
  11: 'B',
};

type NoteKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export class NoteOnOffMessageRx extends BaseMidiMessageRx {
  protected type: 'note-on' | 'note-off';
  protected note: string;

  constructor(rawMessage: RawMidiMessageRx) {
    super(rawMessage);
    this.source = rawMessage.source;
    this.type = rawMessage.type as 'note-on' | 'note-off';
    this.channel = rawMessage.channel;
    this.note = this.parseNote(rawMessage.firstVal);
  }

  private parseNote(noteVal: number) {
    const octave = Math.floor(noteVal / 12);
    const note = NoteMap[(noteVal % 12) as NoteKey];
    return `${note}${octave}`;
  }
}

export class MidiMessageRx {
  private channel: MidiChannel = 1;
  // TODO change initialization here
  private type: MidiMessageRxType = 'note-off';
  private secondByte: number = -1;
  private thirdByte: number = -1;

  constructor(private inputDevice: WebMidi.MIDIInput, private messageEvent: WebMidi.MIDIMessageEvent) {
    this.parseFirstByte();
    this.parseSecondByte();
    this.parseThirdByte();
    console.log(
      `RX: ${this.inputDevice.name} channel:${this.channel}, type:${this.type}, b2:${this.secondByte}, b3:${this.thirdByte}`,
    );
  }

  private get byteBuffer() {
    return this.messageEvent.data;
  }

  private parseFirstByte(): void {
    const firstByte = this.byteBuffer[0];

    this.channel = ((firstByte & 0b1111) + 1) as MidiChannel;
    const typeBits = firstByte >> 4;

    switch (typeBits) {
      case 8:
        this.type = 'note-off';
        break;
      case 9:
        this.type = 'note-on';
        break;
      case 10:
        this.type = 'polyphonic-key-pressure';
        break;
      case 11:
        this.type = 'control-change';
        break;
      case 12:
        this.type = 'program-change';
        break;
      case 13:
        this.type = 'channel-pressure';
        break;
      case 14:
        this.type = 'pitch-bend';
        break;
    }
  }

  private parseSecondByte(): void {
    this.secondByte = this.byteBuffer[1];
  }

  private parseThirdByte(): void {
    this.thirdByte = this.byteBuffer[2] ?? -1;
  }
}
