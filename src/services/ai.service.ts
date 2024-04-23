
export class AIService {

  constructor() { }

  async prompt(
    input: string
  ): Promise<string> {
    // TODO: implement connection to AI service
    return input;
  }

  async generateTitle(
    prompt: string
  ): Promise<string> {
    return `Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit`;
  }

  async generateContent(
    prompt: string
  ): Promise<string> {
    return `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Donec nibh sem, suscipit quis lorem ut, egestas mattis sem.
    Sed et massa maximus, ornare leo a, hendrerit erat.
    Donec nec tempus nunc, in ultrices mauris.
    Nam feugiat massa eget ipsum vulputate, ac iaculis elit posuere.
    Ut ornare suscipit turpis ut mollis. Vestibulum et nibh a libero ultricies efficitur.
    Proin ut suscipit nunc. Nullam mollis diam in ipsum tincidunt sodales. Praesent sollicitudin tempor elit.
    Donec accumsan placerat nibh, a vehicula libero porttitor eu.`;
  }
}
