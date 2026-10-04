#include <Arduino.h>
#include <Wire.h>
#include <DHT.h>
#include <pritam_ghosal-project-1_inferencing.h>

// =====================================================
// DHT22
// =====================================================

#define DHT_PIN 4
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);


// =====================================================
// BMP280
// =====================================================

#define BMP280_SDA 8
#define BMP280_SCL 9
#define BMP280_ADDR 0x76


// =====================================================
// BMP280 CALIBRATION
// =====================================================

uint16_t dig_T1;
int16_t dig_T2, dig_T3;

uint16_t dig_P1;
int16_t dig_P2, dig_P3, dig_P4;
int16_t dig_P5, dig_P6, dig_P7, dig_P8, dig_P9;


// =====================================================
// EDGE IMPULSE FEATURES
// =====================================================

float features[6];


// =====================================================
// BMP280 READ REGISTER
// =====================================================

uint8_t readRegister(uint8_t reg)
{
    Wire.beginTransmission(BMP280_ADDR);
    Wire.write(reg);
    Wire.endTransmission(false);

    Wire.requestFrom(BMP280_ADDR, (uint8_t)1);

    if (Wire.available())
    {
        return Wire.read();
    }

    return 0xFF;
}


// =====================================================
// BMP280 WRITE REGISTER
// =====================================================

void writeRegister(uint8_t reg, uint8_t value)
{
    Wire.beginTransmission(BMP280_ADDR);

    Wire.write(reg);
    Wire.write(value);

    Wire.endTransmission();
}


// =====================================================
// READ 16 BIT
// =====================================================

uint16_t read16(uint8_t reg)
{
    uint8_t lsb = readRegister(reg);
    uint8_t msb = readRegister(reg + 1);

    return ((uint16_t)msb << 8) | lsb;
}


// =====================================================
// READ SIGNED 16 BIT
// =====================================================

int16_t readS16(uint8_t reg)
{
    return (int16_t)read16(reg);
}


// =====================================================
// BMP280 CALIBRATION
// =====================================================

void readCalibration()
{
    dig_T1 = read16(0x88);
    dig_T2 = readS16(0x8A);
    dig_T3 = readS16(0x8C);

    dig_P1 = read16(0x8E);
    dig_P2 = readS16(0x90);
    dig_P3 = readS16(0x92);
    dig_P4 = readS16(0x94);
    dig_P5 = readS16(0x96);
    dig_P6 = readS16(0x98);
    dig_P7 = readS16(0x9A);
    dig_P8 = readS16(0x9C);
    dig_P9 = readS16(0x9E);
}


// =====================================================
// BMP280 PRESSURE
// Returns hPa
// =====================================================

float readBMP280()
{
    // Forced measurement
    writeRegister(0xF4, 0x25);

    delay(100);

    uint8_t pMSB  = readRegister(0xF7);
    uint8_t pLSB  = readRegister(0xF8);
    uint8_t pXLSB = readRegister(0xF9);

    uint8_t tMSB  = readRegister(0xFA);
    uint8_t tLSB  = readRegister(0xFB);
    uint8_t tXLSB = readRegister(0xFC);


    uint32_t adc_P =
        ((uint32_t)pMSB << 12) |
        ((uint32_t)pLSB << 4) |
        (pXLSB >> 4);


    uint32_t adc_T =
        ((uint32_t)tMSB << 12) |
        ((uint32_t)tLSB << 4) |
        (tXLSB >> 4);


    // =================================================
    // TEMPERATURE COMPENSATION
    // =================================================

    int32_t var1;
    int32_t var2;
    int32_t t_fine;


    var1 =
        ((((int32_t)adc_T >> 3) -
        ((int32_t)dig_T1 << 1))
        * (int32_t)dig_T2) >> 11;


    var2 =
        (((((int32_t)adc_T >> 4) -
        (int32_t)dig_T1) *
        (((int32_t)adc_T >> 4) -
        (int32_t)dig_T1)) >> 12);


    var2 =
        (var2 * (int32_t)dig_T3) >> 14;


    t_fine = var1 + var2;


    // =================================================
    // PRESSURE COMPENSATION
    // =================================================

    int64_t p_var1;
    int64_t p_var2;
    int64_t p;


    p_var1 =
        ((int64_t)t_fine) - 128000;


    p_var2 =
        p_var1 * p_var1 * (int64_t)dig_P6;


    p_var2 =
        p_var2 +
        ((p_var1 * (int64_t)dig_P5) << 17);


    p_var2 =
        p_var2 +
        (((int64_t)dig_P4) << 35);


    p_var1 =
        ((p_var1 * p_var1 *
        (int64_t)dig_P3) >> 8);


    p_var1 =
        p_var1 +
        (((int64_t)dig_P2) << 12);


    p_var1 =
        (((((int64_t)1) << 47) + p_var1) *
        (int64_t)dig_P1) >> 33;


    if (p_var1 == 0)
    {
        return 0;
    }


    p =
        1048576 -
        (int64_t)adc_P;


    p =
        (((p << 31) - p_var2) * 3125) /
        p_var1;


    p_var1 =
        ((int64_t)dig_P9 *
        (p >> 13) *
        (p >> 13)) >> 25;


    p_var2 =
        ((int64_t)dig_P8 * p) >> 19;


    p =
        ((p + p_var1 + p_var2) >> 8) +
        (((int64_t)dig_P7) << 4);


    // Pa -> hPa
    return p / 25600.0;
}


// =====================================================
// EDGE IMPULSE DATA CALLBACK
// =====================================================

int raw_feature_get_data(
    size_t offset,
    size_t length,
    float *out_ptr)
{
    memcpy(
        out_ptr,
        features + offset,
        length * sizeof(float)
    );

    return 0;
}


// =====================================================
// PRINT EDGE IMPULSE RESULT
// =====================================================

void print_inference_result(ei_impulse_result_t result)
{
    Serial.println();
    Serial.println("================================");
    Serial.println("EDGE IMPULSE RESULT");
    Serial.println("================================");


    Serial.print("DSP: ");
    Serial.print(result.timing.dsp);
    Serial.println(" ms");


    Serial.print("Classification: ");
    Serial.print(result.timing.classification);
    Serial.println(" ms");


    Serial.println();
    Serial.println("Predictions:");


    for (
        uint16_t i = 0;
        i < EI_CLASSIFIER_LABEL_COUNT;
        i++
    )
    {
        Serial.print("  ");

        Serial.print(
            ei_classifier_inferencing_categories[i]
        );

        Serial.print(": ");

        Serial.println(
            result.classification[i].value,
            5
        );
    }


#if EI_CLASSIFIER_HAS_ANOMALY

    Serial.println();

    Serial.print("Anomaly score: ");

    Serial.println(
        result.anomaly,
        5
    );

#endif

    Serial.println("================================");
}


// =====================================================
// SETUP
// =====================================================

void setup()
{
    Serial.begin(115200);

    delay(2000);


    Serial.println();
    Serial.println("================================");
    Serial.println("ESP32-S3");
    Serial.println("DHT22 + BMP280");
    Serial.println("EDGE IMPULSE");
    Serial.println("LATENCY MONITOR");
    Serial.println("================================");


    // =================================================
    // DHT22
    // =================================================

    dht.begin();

    Serial.println("DHT22 started");


    // =================================================
    // BMP280 I2C
    // =================================================

    Wire.begin(
        BMP280_SDA,
        BMP280_SCL
    );


    // =================================================
    // CHECK BMP280
    // =================================================

    uint8_t chipID =
        readRegister(0xD0);


    Serial.print("BMP280 Chip ID: 0x");

    Serial.println(
        chipID,
        HEX
    );


    if (chipID != 0x58)
    {
        Serial.println();
        Serial.println("BMP280 NOT FOUND!");
        Serial.println("Check wiring.");

        while (1)
        {
            delay(1000);
        }
    }


    Serial.println("BMP280 detected");


    // =================================================
    // RESET
    // =================================================

    writeRegister(
        0xE0,
        0xB6
    );


    delay(200);


    // =================================================
    // CALIBRATION
    // =================================================

    readCalibration();

    Serial.println(
        "BMP280 calibration loaded"
    );


    // =================================================
    // EDGE IMPULSE MODEL INFORMATION
    // =================================================

    Serial.println();

    Serial.print(
        "Model frame size: "
    );

    Serial.println(
        EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE
    );


    Serial.print(
        "Samples per frame: "
    );

    Serial.println(
        EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME
    );


    Serial.println();
    Serial.println("System ready.");
}


// =====================================================
// LOOP
// =====================================================

void loop()
{
    Serial.println();
    Serial.println("Reading sensors...");


    // =================================================
    // TOTAL SENSOR LATENCY START
    // =================================================

    unsigned long totalSensorStart = micros();


    // =================================================
    // SAMPLE 1
    // =================================================

    unsigned long dht1Start = micros();

    float temperature1 =
        dht.readTemperature();

    float humidity1 =
        dht.readHumidity();

    unsigned long dht1End = micros();

    unsigned long dht1Latency =
        dht1End - dht1Start;


    // =================================================
    // SAMPLE 1 - BMP280
    // =================================================

    unsigned long bmp1Start = micros();

    float pressure1 =
        readBMP280();

    unsigned long bmp1End = micros();

    unsigned long bmp1Latency =
        bmp1End - bmp1Start;


    if (
        isnan(temperature1) ||
        isnan(humidity1)
    )
    {
        Serial.println(
            "DHT22 reading failed!"
        );

        Serial.print("DHT22 latency: ");
        Serial.print(dht1Latency);
        Serial.println(" us");

        delay(2000);

        return;
    }


    // =================================================
    // PRINT SAMPLE 1
    // =================================================

    Serial.println();
    Serial.println("Sample 1:");

    Serial.print("Temperature: ");
    Serial.print(temperature1, 2);
    Serial.println(" °C");

    Serial.print("Humidity: ");
    Serial.print(humidity1, 2);
    Serial.println(" %");

    Serial.print("Pressure: ");
    Serial.print(pressure1, 2);
    Serial.println(" hPa");


    // =================================================
    // SAMPLE 1 LATENCY
    // =================================================

    Serial.println();
    Serial.println("Sample 1 Latency:");

    Serial.print("DHT22 latency: ");
    Serial.print(dht1Latency);
    Serial.print(" us (");
    Serial.print(dht1Latency / 1000.0, 3);
    Serial.println(" ms)");

    Serial.print("BMP280 latency: ");
    Serial.print(bmp1Latency);
    Serial.print(" us (");
    Serial.print(bmp1Latency / 1000.0, 3);
    Serial.println(" ms)");


    // =================================================
    // WAIT
    // =================================================

    delay(2000);


    // =================================================
    // SAMPLE 2
    // =================================================

    unsigned long dht2Start = micros();

    float temperature2 =
        dht.readTemperature();

    float humidity2 =
        dht.readHumidity();

    unsigned long dht2End = micros();

    unsigned long dht2Latency =
        dht2End - dht2Start;


    // =================================================
    // SAMPLE 2 - BMP280
    // =================================================

    unsigned long bmp2Start = micros();

    float pressure2 =
        readBMP280();

    unsigned long bmp2End = micros();

    unsigned long bmp2Latency =
        bmp2End - bmp2Start;


    if (
        isnan(temperature2) ||
        isnan(humidity2)
    )
    {
        Serial.println(
            "DHT22 reading failed!"
        );

        Serial.print("DHT22 latency: ");
        Serial.print(dht2Latency);
        Serial.println(" us");

        delay(2000);

        return;
    }


    // =================================================
    // PRINT SAMPLE 2
    // =================================================

    Serial.println();
    Serial.println("Sample 2:");

    Serial.print("Temperature: ");
    Serial.print(temperature2, 2);
    Serial.println(" °C");

    Serial.print("Humidity: ");
    Serial.print(humidity2, 2);
    Serial.println(" %");

    Serial.print("Pressure: ");
    Serial.print(pressure2, 2);
    Serial.println(" hPa");


    // =================================================
    // SAMPLE 2 LATENCY
    // =================================================

    Serial.println();
    Serial.println("Sample 2 Latency:");

    Serial.print("DHT22 latency: ");
    Serial.print(dht2Latency);
    Serial.print(" us (");
    Serial.print(dht2Latency / 1000.0, 3);
    Serial.println(" ms)");

    Serial.print("BMP280 latency: ");
    Serial.print(bmp2Latency);
    Serial.print(" us (");
    Serial.print(bmp2Latency / 1000.0, 3);
    Serial.println(" ms)");


    // =================================================
    // TOTAL SENSOR LATENCY
    // =================================================

    unsigned long totalSensorLatency =
        micros() - totalSensorStart;


    Serial.println();
    Serial.println("================================");
    Serial.println("TOTAL SENSOR LATENCY");
    Serial.println("================================");

    Serial.print("Total latency: ");
    Serial.print(totalSensorLatency);
    Serial.println(" us");

    Serial.print("Total latency: ");
    Serial.print(totalSensorLatency / 1000.0, 3);
    Serial.println(" ms");

    Serial.println("================================");


    // =================================================
    // CREATE EDGE IMPULSE FEATURES
    //
    // T1, H1, P1, T2, H2, P2
    // =================================================

    features[0] = temperature1;
    features[1] = humidity1;
    features[2] = pressure1;

    features[3] = temperature2;
    features[4] = humidity2;
    features[5] = pressure2;


    // =================================================
    // PRINT FEATURES
    // =================================================

    Serial.println();
    Serial.println("Features sent to Edge Impulse:");

    for (int i = 0; i < 6; i++)
    {
        Serial.print(
            features[i],
            4
        );

        if (i < 5)
        {
            Serial.print(", ");
        }
    }

    Serial.println();


    // =================================================
    // CHECK MODEL SIZE
    // =================================================

    if (
        EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE != 6
    )
    {
        Serial.println();
        Serial.println(
            "ERROR: Model does not expect 6 values!"
        );

        Serial.print(
            "Model expects: "
        );

        Serial.println(
            EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE
        );

        Serial.println(
            "Current code provides: 6"
        );

        delay(3000);

        return;
    }


    // =================================================
    // CREATE SIGNAL
    // =================================================

    signal_t signal;

    signal.total_length = 6;

    signal.get_data =
        &raw_feature_get_data;


    // =================================================
    // RUN EDGE IMPULSE
    // =================================================

    Serial.println();
    Serial.println(
        "Running Edge Impulse..."
    );


    // =================================================
    // INFERENCE LATENCY START
    // =================================================

    unsigned long inferenceStart =
        micros();


    ei_impulse_result_t result = { 0 };


    EI_IMPULSE_ERROR res =
        run_classifier(
            &signal,
            &result,
            false
        );


    // =================================================
    // INFERENCE LATENCY END
    // =================================================

    unsigned long inferenceEnd =
        micros();

    unsigned long inferenceLatency =
        inferenceEnd - inferenceStart;


    // =================================================
    // CHECK RESULT
    // =================================================

    if (
        res != EI_IMPULSE_OK
    )
    {
        Serial.print(
            "Classifier error: "
        );

        Serial.println(
            res
        );

        Serial.print("Inference latency: ");
        Serial.print(inferenceLatency);
        Serial.println(" us");

        delay(2000);

        return;
    }


    // =================================================
    // PRINT EDGE IMPULSE RESULT
    // =================================================

    print_inference_result(
        result
    );


    // =================================================
    // PRINT INFERENCE LATENCY
    // =================================================

    Serial.println();
    Serial.println("================================");
    Serial.println("EDGE IMPULSE LATENCY");
    Serial.println("================================");

    Serial.print("Inference latency: ");
    Serial.print(inferenceLatency);
    Serial.println(" us");

    Serial.print("Inference latency: ");
    Serial.print(inferenceLatency / 1000.0, 3);
    Serial.println(" ms");

    Serial.println("================================");


    // =================================================
    // TOTAL SYSTEM LATENCY
    //
    // Sensor reading + Edge Impulse inference
    // =================================================

    unsigned long totalSystemLatency =
        micros() - totalSensorStart;


    Serial.println();
    Serial.println("================================");
    Serial.println("TOTAL SYSTEM LATENCY");
    Serial.println("================================");

    Serial.print("Sensor latency: ");
    Serial.print(totalSensorLatency / 1000.0, 3);
    Serial.println(" ms");

    Serial.print("Inference latency: ");
    Serial.print(inferenceLatency / 1000.0, 3);
    Serial.println(" ms");

    Serial.print("Total system latency: ");
    Serial.print(totalSystemLatency / 1000.0, 3);
    Serial.println(" ms");

    Serial.println("================================");


    // =================================================
    // NEXT CYCLE
    // =================================================

    delay(3000);
}