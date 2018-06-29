/**
 * separate parts and make them exchangeable for easier creation of list view
 * have datasources for data and loading of it
 * and have template strings for custom list views
 *
 */





export
const previewListViewItemDefinition = {
    template: `<a-plane simple-clipping="dimensions:.5 1 .5 1"
                 gui-border
                 v-for="(item, index) in getVisibleItems(-2,2)"
                 opacity="0.3"
                 :color="isSelected(index)?'blue':isHovered(index)?'slateblue':'grey'"
                 :position="setPositionFromIndex(index,5,2,2,1)"

                 width="2"
                 @focus="onItemHover(index)"
                 @interaction-pick.stop="onItemSelected(index)"
                 @interaction-talk.stop="onItemClicked(index)"
                 :selected="isSelected(index)?true:null"
        >
            <a-entity  v-if="isSelected(index)"  light="type: directional; color: #cc9; intensity: 0.7" position="1 1 0"></a-entity>
            <a-entity class="bike-parts"
                      :mesh-preview="{'part-selector':item.part,selector:item.selector,scalingFactor:item.scaling}"

                      position='0 -.4 2'
                      :animation__rotate="isSelected(index)||isHovered(index)?'property: rotation; from:0 0 0; to: 0 360 0; dur: 5000; easing: linear;loop:true':null">
            </a-entity>
        </a-plane>`,
    schema:"key,value,scaling,selector,part,position"



}



