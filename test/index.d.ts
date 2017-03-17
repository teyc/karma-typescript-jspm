declare function describe(description: string, test: () => void)
declare function it(description: string, test: () => void)
declare function expect(o: any) : Comparison;

interface Comparison {
    toBe(o: any);
}
