TODO implement workflow that allows testing of regions and components like storybook for react


The issue here is to have some unit test like container where components and regions may be tested individually
* say we do have a component that generates a terrain.
    * we should be testing it for full life cycle 
        * create 
        * tick
        * remove
        * rinse and repeat
    * benchmarks should be
        * average fps
        * memory
        * fps spikes
        * memory leaks
        
        
* gltf-pipeline
    * https://www.npmjs.com/package/gltf-pipeline
    could be used to inspect models beforehand and help optimizing them