from tensorflow import keras
import os

import tensorflowjs as tfjs

# path to model from dir
model_path = os.path.join("model_data", "basic_model.keras")
model = keras.models.load_model(model_path)

# model.save("model_data/output/tfjs_export", save_format="tf") # issues in tsx because not h5?

tfjs_target_dir = os.path.join("model_data", "tfjs_model")
tfjs.converters.save_keras_model(model, tfjs_target_dir)

print(f"Converted to TensorFlow.js format in {tfjs_target_dir}")