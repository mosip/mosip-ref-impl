package io.mosip.sdk.client;

import io.mosip.kernel.biometrics.constant.BiometricType;
import io.mosip.kernel.biometrics.constant.Match;
import io.mosip.kernel.biometrics.entities.BDBInfo;
import io.mosip.kernel.biometrics.entities.BIR;
import io.mosip.kernel.biometrics.entities.BiometricRecord;
import io.mosip.kernel.biometrics.entities.VersionType;
import io.mosip.kernel.biometrics.model.*;
import io.mosip.sdk.client.impl.SampleSDK;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.IOException;
import java.util.*;

import static java.lang.Integer.parseInt;

public class SampleSDKTest {

    Logger LOGGER = LoggerFactory.getLogger(SampleSDKTest.class);

    private String samplePath = "";
    private String sampleIrisNoMatchPath = "";
    private String sampleFullMatchPath = "";
    private String sampleFaceMissing = "";

    @Before
    public void Setup() {
        samplePath = SampleSDKTest.class.getResource("/sample_files/sample.xml").getPath();
        sampleIrisNoMatchPath = SampleSDKTest.class.getResource("/sample_files/sample_iris_no_match.xml").getPath();
        sampleFullMatchPath = SampleSDKTest.class.getResource("/sample_files/sample_full_match.xml").getPath();
        sampleFaceMissing = SampleSDKTest.class.getResource("/sample_files/sample_face_missing.xml").getPath();
    }

    @Test
    public void match_different_iris() {
        try {
            List<BiometricType> modalitiesToMatch = new ArrayList<BiometricType>(){{
                add(BiometricType.FACE);
                add(BiometricType.FINGER);
                add(BiometricType.IRIS);
            }};
            BiometricRecord[] gallery = new BiometricRecord[1];
            BiometricRecord sample_record = xmlFileToBiometricRecord(samplePath);
            BiometricRecord gallery0 = xmlFileToBiometricRecord(sampleIrisNoMatchPath);

            gallery[0] = gallery0;

            SampleSDK sampleSDK = new SampleSDK();
            Response<MatchDecision[]> response = sampleSDK.match(sample_record, gallery, modalitiesToMatch, new HashMap<>());
            MatchDecision[] matchDecisions = response.getResponse();
            for (int i=0; i< matchDecisions.length; i++){
                Map<BiometricType, Decision> decisions = response.getResponse()[i].getDecisions();
                Assert.assertEquals(decisions.get(BiometricType.FACE).toString(), decisions.get(BiometricType.FACE).getMatch().toString(), Match.MATCHED.toString());
                Assert.assertEquals(decisions.get(BiometricType.FINGER).toString(), decisions.get(BiometricType.FINGER).getMatch().toString(), Match.MATCHED.toString());
                Assert.assertEquals(decisions.get(BiometricType.IRIS).toString(), decisions.get(BiometricType.IRIS).getMatch().toString(), Match.NOT_MATCHED.toString());
            }
        } catch (ParserConfigurationException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (SAXException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void match_face_missing() {
        try {
            List<BiometricType> modalitiesToMatch = new ArrayList<BiometricType>(){{
                add(BiometricType.FACE);
                add(BiometricType.FINGER);
                add(BiometricType.IRIS);
            }};
            BiometricRecord[] gallery = new BiometricRecord[1];
            BiometricRecord sample_record = xmlFileToBiometricRecord(samplePath);
            BiometricRecord gallery0 = xmlFileToBiometricRecord(sampleFaceMissing);

            gallery[0] = gallery0;

            SampleSDK sampleSDK = new SampleSDK();
            Response<MatchDecision[]> response = sampleSDK.match(sample_record, gallery, modalitiesToMatch, new HashMap<>());
        } catch (ParserConfigurationException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (SAXException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void check_quality() {
        try {
            List<BiometricType> modalitiesToCheck = new ArrayList<BiometricType>(){{
                add(BiometricType.FACE);
                add(BiometricType.FINGER);
                add(BiometricType.IRIS);
            }};
            BiometricRecord sample_record = xmlFileToBiometricRecord(samplePath);
            SampleSDK sampleSDK = new SampleSDK();
            Response<QualityCheck> response = sampleSDK.checkQuality(sample_record, modalitiesToCheck, new HashMap<>());
        } catch (ParserConfigurationException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (SAXException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void extract_tempalte() {
        try {
            List<BiometricType> modalitiesToExtract = new ArrayList<BiometricType>(){{
                add(BiometricType.FACE);
                add(BiometricType.FINGER);
                add(BiometricType.IRIS);
            }};
            BiometricRecord sample_record = xmlFileToBiometricRecord(samplePath);
            SampleSDK sampleSDK = new SampleSDK();
            Response<BiometricRecord> response = sampleSDK.extractTemplate(sample_record, modalitiesToExtract, new HashMap<>());
        } catch (ParserConfigurationException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (SAXException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void init() {
        Map<String, String> initParams = new HashMap<>();
        SampleSDK sampleSDK = new SampleSDK();
        SDKInfo response = sampleSDK.init(initParams);
    }

    @Test
    public void segment() {
        try {
            List<BiometricType> modalitiesToSegment = new ArrayList<BiometricType>(){{
                add(BiometricType.FACE);
                add(BiometricType.FINGER);
                add(BiometricType.IRIS);
            }};
            BiometricRecord sample_record = xmlFileToBiometricRecord(samplePath);
            SampleSDK sampleSDK = new SampleSDK();
            Response<BiometricRecord> response = sampleSDK.segment(sample_record, modalitiesToSegment, new HashMap<>());
        } catch (ParserConfigurationException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (SAXException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void convert_format() {
        try {
            List<BiometricType> modalitiesToConvert = new ArrayList<BiometricType>(){{
                add(BiometricType.FACE);
                add(BiometricType.FINGER);
                add(BiometricType.IRIS);
            }};
            BiometricRecord sample_record = xmlFileToBiometricRecord(samplePath);
            SampleSDK sampleSDK = new SampleSDK();
            BiometricRecord response = sampleSDK.convertFormat(sample_record, "", "", new HashMap<>(), new HashMap<>(), modalitiesToConvert);
        } catch (ParserConfigurationException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (SAXException e) {
            e.printStackTrace();
        }
    }

    private BiometricRecord xmlFileToBiometricRecord(String path) throws ParserConfigurationException, IOException, SAXException {
        BiometricRecord biometricRecord = new BiometricRecord();
        List bir_segments = new ArrayList();
        File fXmlFile = new File(path);
        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
        Document doc = dBuilder.parse(fXmlFile);
        doc.getDocumentElement().normalize();
        LOGGER.debug("Root element :" + doc.getDocumentElement().getNodeName());
        Node rootBIRElement = doc.getDocumentElement();
        NodeList childNodes = rootBIRElement.getChildNodes();
        for (int temp = 0; temp < childNodes.getLength(); temp++) {
            Node childNode = childNodes.item(temp);
            if(childNode.getNodeName().equalsIgnoreCase("bir")){
                BIR.BIRBuilder bd = new BIR.BIRBuilder();

                /* Version */
                Node nVersion = ((Element) childNode).getElementsByTagName("Version").item(0);
                String major_version = ((Element) nVersion).getElementsByTagName("Major").item(0).getTextContent();
                String minor_version = ((Element) nVersion).getElementsByTagName("Minor").item(0).getTextContent();
                VersionType bir_version = new VersionType(parseInt(major_version), parseInt(minor_version));
                bd.withVersion(bir_version);

                /* CBEFF Version */
                Node nCBEFFVersion = ((Element) childNode).getElementsByTagName("Version").item(0);
                String cbeff_major_version = ((Element) nCBEFFVersion).getElementsByTagName("Major").item(0).getTextContent();
                String cbeff_minor_version = ((Element) nCBEFFVersion).getElementsByTagName("Minor").item(0).getTextContent();
                VersionType cbeff_bir_version = new VersionType(parseInt(cbeff_major_version), parseInt(cbeff_minor_version));
                bd.withCbeffversion(cbeff_bir_version);

                /* BDB Info */
                Node nBDBInfo = ((Element) childNode).getElementsByTagName("BDBInfo").item(0);
                String bdb_info_type = "";
                String bdb_info_subtype = "";
                NodeList nBDBInfoChilds = nBDBInfo.getChildNodes();
                for (int z=0; z < nBDBInfoChilds.getLength(); z++){
                    Node nBDBInfoChild = nBDBInfoChilds.item(z);
                    if(nBDBInfoChild.getNodeName().equalsIgnoreCase("Type")){
                        bdb_info_type = nBDBInfoChild.getTextContent();
                    }
                    if(nBDBInfoChild.getNodeName().equalsIgnoreCase("Subtype")){
                        bdb_info_subtype = nBDBInfoChild.getTextContent();
                    }
                }

                BDBInfo.BDBInfoBuilder bdbInfoBuilder = new BDBInfo.BDBInfoBuilder();
                bdbInfoBuilder.withType(Arrays.asList(BiometricType.fromValue(bdb_info_type)));
                bdbInfoBuilder.withSubtype(Arrays.asList(bdb_info_subtype));
                BDBInfo bdbInfo = new BDBInfo(bdbInfoBuilder);
                bd.withBdbInfo(bdbInfo);

                /* BDB */
                String nBDB = ((Element) childNode).getElementsByTagName("BDB").item(0).getTextContent();
                bd.withBdb(nBDB.getBytes());

                /* Prepare BIR */
                BIR bir = new BIR(bd);

                /* Add BIR to list of segments */
                bir_segments.add(bir);
            }
        }
        biometricRecord.setSegments(bir_segments);
        return biometricRecord;
    }

}
