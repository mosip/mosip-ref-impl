package io.mosip.sdk.util;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.ArrayUtils;

import java.security.NoSuchAlgorithmException;

public class Util {

    public static boolean compareHash(byte[] s1, byte[] s2) throws NoSuchAlgorithmException {
        String checksum1 = computeFingerPrint(s1, null).toLowerCase();
        String checksum2 = computeFingerPrint(s2, null).toLowerCase();
        return checksum1.equals(checksum2);
    }

    public static String computeFingerPrint(byte[] data, String metaData) throws NoSuchAlgorithmException {
        byte[] combinedPlainTextBytes = null;
        if (metaData == null) {
            combinedPlainTextBytes = ArrayUtils.addAll(data);
        } else {
            combinedPlainTextBytes = ArrayUtils.addAll(data, metaData.getBytes());
        }
        return DigestUtils.sha256Hex(combinedPlainTextBytes);
    }
}
