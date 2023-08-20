export class Box {
  // TODO: memoize all functions beginning with 'get_'.  Use for-in loop.
  // get_longest_axis gets called twice now, and others may also.

  data: any; // it's all about the data
  box: any; // the bounding box of the data
  dim: any; // number of dimensions in the data

  is_nan() {
    return isNaN(this.data[0]) || isNaN(this.data[1]) || isNaN(this.data[2]);
  }

  calculate_bounding_box() {
    // keeps running tally of the min and max values on each dimension
    // initialize the min value to the highest number possible, and the
    // max value to the lowest number possible

    var i;
    var minmax = [
      { min: Number.MAX_VALUE, max: Number.MIN_VALUE },
      { min: Number.MAX_VALUE, max: Number.MIN_VALUE },
      { min: Number.MAX_VALUE, max: Number.MIN_VALUE },
    ];

    for (i = this.data.length - 1; i >= 0; i -= 1) {
      minmax[0].min =
        this.data[i][0] < minmax[0].min ? this.data[i][0] : minmax[0].min; // r
      minmax[1].min =
        this.data[i][1] < minmax[1].min ? this.data[i][1] : minmax[1].min; // g
      minmax[2].min =
        this.data[i][2] < minmax[2].min ? this.data[i][2] : minmax[2].min; // b

      minmax[0].max =
        this.data[i][0] > minmax[0].max ? this.data[i][0] : minmax[0].max; // r
      minmax[1].max =
        this.data[i][1] > minmax[1].max ? this.data[i][1] : minmax[1].max; // g
      minmax[2].max =
        this.data[i][2] > minmax[2].max ? this.data[i][2] : minmax[2].max; // b
    }

    return minmax;
  }

  init(_data: any) {
    // Initializes the data values, number of dimensions in the data
    // (currently fixed to 3 to handle RGB, but may be genericized in
    // the future), and the bounding box of the data.

    this.data = _data;
    this.dim = 3; // lock this to 3 (RGB pixels) for now.
    this.box = this.calculate_bounding_box();
  }

  get_data() {
    return this.data;
  }

  get_longest_axis() {
    // Returns the longest (aka 'widest') axis of the data in this box.

    var longest_axis = 0;
    var longest_axis_size = 0;
    var i;
    var axis_size;

    for (i = this.dim - 1; i >= 0; i -= 1) {
      axis_size = this.box[i].max - this.box[i].min;
      if (axis_size > longest_axis_size) {
        longest_axis = i;
        longest_axis_size = axis_size;
      }
    }

    return { axis: longest_axis, length: longest_axis_size };
  }

  get_comparison_func(_i: any) {
    // Return a comparison function based on a given index (for median-cut,
    // sort on the longest axis) ie: sort ONLY on a single axis.
    // get_comparison_func( 1 ) would return a sorting function that sorts
    // the data according to each item's Green value.

    var sort_method = function (a: any, b: any) {
      return a[_i] - b[_i];
    };

    return sort_method;
  }

  sort() {
    // Sorts all the elements in this box based on their values on the
    // longest axis.

    var a = this.get_longest_axis().axis;
    var sort_method = this.get_comparison_func(a);

    Array.prototype.sort.call(this.data, sort_method);

    return this.data;
  }

  mean_pos() {
    // Returns the position of the median value of the data in
    // this box.  The position number is rounded down, to deal
    // with cases when the data has an odd number of elements.

    var mean_i;
    var mean = 0;
    var smallest_diff = Number.MAX_VALUE;
    var axis = this.get_longest_axis().axis;
    var diff;
    var i;

    // sum all the data along the longest axis...
    for (i = this.data.length - 1; i >= 0; i -= 1) {
      mean += this.data[i][axis];
    }
    mean /= this.data.length;

    // find the data point that is closest to the mean
    for (i = this.data.length - 1; i >= 0; i -= 1) {
      diff = Math.abs(this.data[i][axis] - mean);
      if (diff < smallest_diff) {
        smallest_diff = diff;
        mean_i = i;
      }
    }

    // return the index of the data point closest to the mean

    return mean_i;
  }

  split() {
    // Splits this box in two and returns two box objects. This function
    // represents steps 2 and 3 of the algorithm, as written at the top
    // of this file.

    this.sort();

    var med = this.mean_pos();
    var data1 = Array.prototype.slice.call(this.data, 0, med); // elements 0 through med
    var data2 = Array.prototype.slice.call(this.data, med); // elements med through end
    var box1 = new Box();
    var box2 = new Box();

    box1.init(data1);
    box2.init(data2);

    return [box1, box2];
  }

  average() {
    // Returns the average value of the data in this box

    var avg_r = 0;
    var avg_g = 0;
    var avg_b = 0;
    var i;

    for (i = this.data.length - 1; i >= 0; i -= 1) {
      avg_r += this.data[i][0];
      avg_g += this.data[i][1];
      avg_b += this.data[i][2];
    }

    avg_r /= this.data.length;
    avg_g /= this.data.length;
    avg_b /= this.data.length;

    // @ts-ignore
    return [parseInt(avg_r, 10), parseInt(avg_g, 10), parseInt(avg_b, 10)];
  }

  median_pos() {
    // Returns the position of the median value of the data in
    // this box.  The position number is rounded down, to deal
    // with cases when the data has an odd number of elements.

    return Math.floor(this.data.length / 2);
  }

  is_empty() {
    // Self-explanatory

    return this.data.length === 0;
  }

  is_splittable() {
    // A box is considered splittable if it has two or more items.

    return this.data.length >= 2;
  }

  get_bounding_box() {
    // Getter for the bounding box
    return this.box;
  }
}

export class MCut {
  boxes: any[] = [];
  data: any[] = [];

  init_boxes(_data: any) {
    var succeeded = false;

    if (this.is_valid_data(_data)) {
      var box1 = new Box();
      box1.init(_data);
      this.boxes = [box1];
      succeeded = true;
    }

    return succeeded;
  }

  is_valid_data(_data: any) {
    var has_length = _data.length > 0;

    return has_length;
  }

  init(_data: any) {
    var boxes_init_success = this.init_boxes(_data);

    if (boxes_init_success) {
      this.data = _data;
    }
  }

  get_longest_box_index() {
    // find the box with the longest axis of them all...
    var longest_box_index = 0;
    var box_index;

    for (box_index = this.boxes.length - 1; box_index >= 0; box_index -= 1) {
      if (this.boxes[box_index] > longest_box_index) {
        longest_box_index = this.boxes[box_index];
      }
    }

    return longest_box_index;
  }

  get_boxes() {
    return this.boxes;
  }

  get_dynamic_size_palette(_threshold: any) {
    // threshold is a value in (0,1] that influences how many colors
    // will be in the resulting palette.  lower values of threshold
    // will result in a smaller palette size.

    var value;
    var values;
    var i;
    var longest_box_index;
    var longest_axis;
    var min_box_length;
    var box_to_split;
    var split_boxes;
    var box1;
    var box2;

    this.init_boxes(this.data);

    // If there isn't any data, return early
    if (this.boxes.length === 0) {
      return [];
    }

    values = [];
    longest_box_index = this.get_longest_box_index();
    longest_axis = this.boxes[longest_box_index].get_longest_axis();

    // a rough calculation of how big the palette should be
    min_box_length = longest_axis.length * (1 - _threshold);

    // but regardless of _threshold, the palette size should never
    // exceed number of input data points

    do {
      // remove the longest box and split it
      box_to_split = this.boxes.splice(longest_box_index, 1)[0];
      split_boxes = box_to_split.split();

      box1 = split_boxes[0];
      box2 = split_boxes[1];

      // then push the resulting boxes into the boxes array
      this.boxes.push(box1);
      this.boxes.push(box2);

      longest_box_index = this.get_longest_box_index();
      longest_axis = this.boxes[longest_box_index].get_longest_axis();
    } while (longest_axis.length > min_box_length);

    // palette is complete.  get the average colors from each box
    // and push them into the values array, then return.
    for (i = 0; i < this.boxes.length; i += 1) {
      // check for NaN values (the results of splitting where no
      // split should have been done)
      // TODO fix NaNs
      value = this.boxes[i].average();
      if (!isNaN(value[0]) || !isNaN(value[0]) || !isNaN(value[0])) {
        values.push(this.boxes[i].average());
      }
    }

    return values;
  }

  get_fixed_size_palette(_number: any) {
    var values = [];
    var i;
    var longest_box_index;
    var box_to_split;
    var split_boxes;

    this.init_boxes(this.data);

    // If there isn't any data, return early
    if (this.boxes.length === 0) {
      return [];
    }

    for (i = _number - 1; i >= 0; i -= 1) {
      longest_box_index = this.get_longest_box_index();

      // remove the longest box and split it
      box_to_split = this.boxes.splice(longest_box_index, 1)[0];

      // TODO: If the box is large enough to be split, split it.
      // Otherwise, push the box itself onto the boxes stack.  This is
      // probably *non-desireable* behavior (i.e. it doesn't behave as
      // the median cut algorithm should), but it's a side effect of
      // requiring a fixed size palette.

      if (box_to_split.is_splittable()) {
        // split the box and push both new boxes
        split_boxes = box_to_split.split();
        this.boxes.push(split_boxes[0]);
        this.boxes.push(split_boxes[1]);
      } else {
        // else... the box is too small to be split.  Push it into the
        // set of boxes twice in order to guarantee the fixed-size
        // palette.
        this.boxes.push(box_to_split);
        this.boxes.push(box_to_split);
      }
    }

    // palette is complete.  get the average colors from each box
    // and push them into the values array, then return.
    for (i = _number - 1; i >= 0; i -= 1) {
      values.push(this.boxes[i].average());
    }

    return values;
  }
}

export function findNearestColor(
  pixel: [number, number, number],
  palette: [number, number, number][]
) {
  let minDistance = Infinity;
  let nearestColor = null;

  for (let color of palette) {
    let distance = euclideanDistance(pixel, color);
    if (distance < minDistance) {
      minDistance = distance;
      nearestColor = color;
    }
  }

  return nearestColor;
}

export function euclideanDistance(
  color1: [number, number, number],
  color2: [number, number, number]
) {
  let rDiff = color1[0] - color2[0];
  let gDiff = color1[1] - color2[1];
  let bDiff = color1[2] - color2[2];

  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}
