import React, { useContext, useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import config from "../../config.json";
import {
  IconButton,
  Heading,
  TextInput,
  Select,
  SelectItem,
  Button,
  Grid,
  Column,
  Checkbox,
  FileUploader,
  Tag,
  Section,
  Breadcrumb,
  BreadcrumbItem,
  Stack,
  Loading,
} from "@carbon/react";
import { Launch, Subtract } from "@carbon/react/icons";
import {
  getFromOpenElisServer,
  postToOpenElisServerFullResponse,
  hasRole,
} from "../utils/Utils";
import UserSessionDetailsContext from "../../UserSessionDetailsContext";
import { NotificationContext } from "../layout/Layout";
import { AlertDialog, NotificationKinds } from "../common/CustomNotification";
import { SearchResults } from "../resultPage/SearchResultForm";
import { FormattedMessage, useIntl } from "react-intl";
import "./../pathology/PathologyDashboard.css";

export const QuestionnaireResponse = ({ questionnaireResponse }) => {
  const renderQuestionResponse = (item) => {
    console.log(JSON.stringify(item));
    return (
      <>
        <div className="questionnaireResponseItem">
          <Grid>
            <Column lg={6} md={8} sm={4}><h6>{item.text}:</h6> </Column>
            <Column lg={10} md={8} sm={4}>
              {item.answer &&
                item.answer.map((answer, index) => {
                  return <Tag key={index}>{renderAnswer(answer)}</Tag>;
                })}
            </Column>
          </Grid> 
        </div>
      </>
    );
  };

  const renderAnswer = (answer) => {
    console.log(JSON.stringify(answer));

    var display = "";
    if ("valueString" in answer) {
      display = answer.valueString;
    } else if ("valueBoolean" in answer) {
      display = answer.valueBoolean;
    } else if ("valueCoding" in answer) {
      display = answer.valueCoding.display;
    } else if ("valueDate" in answer) {
      display = answer.valueDate;
    } else if ("valueDecimal" in answer) {
      display = answer.valueDecimal;
    } else if ("valueInteger" in answer) {
      display = answer.valueInteger;
    } else if ("valueQuantity" in answer) {
      display = answer.valueQuantity.value + answer.valueQuantity.unit;
    } else if ("valueTime" in answer) {
      display = answer.valueTime;
    }
    return (
      <>
        <span className="questionnaireResponseAnswer">{display}</span>
      </>
    );
  };

  return (
    <>
      {questionnaireResponse &&
        questionnaireResponse.item.map((item, index) => {
          return <span key={index}>{renderQuestionResponse(item)}</span>;
        })}
    </>
  );
};

function ImmunohistochemistryCaseView() {
  const componentMounted = useRef(false);

  const { immunohistochemistrySampleId } = useParams();
  const { notificationVisible, setNotificationVisible, setNotificationBody } =
    useContext(NotificationContext);
  const { userSessionDetails } = useContext(UserSessionDetailsContext);
  const [immunohistochemistrySampleInfo, setImmunohistochemistrySampleInfo] =
    useState({ labNumber: "" });

  const [statuses, setStatuses] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);
  const [technicianUsers, setTechnicianUsers] = useState([]);
  const [pathologistUsers, setPathologistUsers] = useState([]);
  const [results, setResults] = useState({ testResult: [] });
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(true);
  const intl = useIntl();
  async function displayStatus(response) {
    var body = await response.json();
    console.log(body);
    var status = response.status;
    setNotificationVisible(true);
    if (status == "200") {
      const save1 = document.getElementById("pathology_save");
      const save2 = document.getElementById("pathology_save2");
      save1.disabled = true;
      save2.disabled = true;
      setNotificationBody({
        kind: NotificationKinds.success,
        title: <FormattedMessage id="notification.title" />,
        message: "Succesfuly saved",
      });
    } else {
      setNotificationBody({
        kind: NotificationKinds.error,
        title: <FormattedMessage id="notification.title" />,
        message: "Error while saving",
      });
    }
  }

  const setResultsWithId = (results) => {
    if (results) {
      var i = 0;
      if (results.testResult) {
        results.testResult.forEach((item) => (item.id = "" + i++));
      }
      setResults(results);
    } else {
      setResults({ testResult: [] });
    }
    setResultsLoading(false);
  };

  const getResults = () => {
    setResults({ testResult: [] });
    var searchEndPoint =
      "/rest/ReactLogbookResultsByRange?" +
      "labNumber=" +
      immunohistochemistrySampleInfo.labNumber +
      "&doRange=" +
      false +
      "&finished=" +
      true +
      "&patientPK=" +
      "&collectionDate=" +
      "&recievedDate=" +
      "&selectedTest=" +
      "&selectedSampleStatus=" +
      "&selectedAnalysisStatus=";
    getFromOpenElisServer(searchEndPoint, setResultsWithId);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const save = () => {
    let submitValues = {
      assignedTechnicianId: immunohistochemistrySampleInfo.assignedTechnicianId,
      assignedPathologistId:
        immunohistochemistrySampleInfo.assignedPathologistId,
      status: immunohistochemistrySampleInfo.status,
      reports: immunohistochemistrySampleInfo.reports,
      release:
        immunohistochemistrySampleInfo.release != undefined
          ? immunohistochemistrySampleInfo.release
          : false,
    };

    postToOpenElisServerFullResponse(
      "/rest/immunohistochemistry/caseView/" + immunohistochemistrySampleId,
      JSON.stringify(submitValues),
      displayStatus,
    );
  };

  const setReportTypeList = (reportTypes) => {
    if (componentMounted.current) {
      setReportTypes(reportTypes);
    }
  };

  const setInitialImmunohistochemistrySampleInfo = (e) => {
    if (
      hasRole(userSessionDetails, "Pathologist") &&
      !e.assignedPathologistId &&
      e.status === "READY_PATHOLOGIST"
    ) {
      e.assignedPathologistId = userSessionDetails.userId;
      e.assignedPathologist =
        userSessionDetails.lastName + " " + userSessionDetails.firstName;
    }
    if (!e.assignedTechnicianId) {
      e.assignedTechnicianId = userSessionDetails.userId;
      e.assignedTechnician =
        userSessionDetails.lastName + " " + userSessionDetails.firstName;
    }
    setImmunohistochemistrySampleInfo(e);
    setLoading(false);
  };

  useEffect(() => {
    componentMounted.current = true;
    getFromOpenElisServer(
      "/rest/displayList/IMMUNOHISTOCHEMISTRY_STATUS",
      setStatuses,
    );
    getFromOpenElisServer(
      "/rest/displayList/IMMUNOHISTOCHEMISTRY_REPORT_TYPES",
      setReportTypeList,
    );
    //TODO make conclusions list instead of reusing pathrequest
    getFromOpenElisServer("/rest/users", setTechnicianUsers);
    getFromOpenElisServer("/rest/users/Pathologist", setPathologistUsers);
    getFromOpenElisServer(
      "/rest/immunohistochemistry/caseView/" + immunohistochemistrySampleId,
      setInitialImmunohistochemistrySampleInfo,
    );

    return () => {
      componentMounted.current = false;
    };
  }, []);

  useEffect(() => {
    componentMounted.current = true;
    getResults();
    return () => {
      componentMounted.current = false;
    };
  }, [immunohistochemistrySampleInfo.labNumber]);

  return (
    <>
      <Grid fullWidth={true}>
        <Column lg={16}>
          <Breadcrumb>
            <BreadcrumbItem href="/">
              {intl.formatMessage({ id: "home.label" })}
            </BreadcrumbItem>
            <BreadcrumbItem href="/ImmunohistochemistryDashboard">
              {intl.formatMessage({
                id: "immunohistochemistry.label.dashboard",
              })}
            </BreadcrumbItem>
          </Breadcrumb>
        </Column>
      </Grid>

      <Grid fullWidth={true}>
        <Column lg={16}>
          <Section>
            <Section>
              <Heading>
                <FormattedMessage id="immunohistochemistry.label.title" />
              </Heading>
            </Section>
          </Section>
        </Column>
      </Grid>
      <Grid fullWidth={true}>
        <Column lg={16}>
          <Section>
            <Section>
              {immunohistochemistrySampleInfo ? (
                <div className="patient-header2">
                  <div className="patient-name">
                    <Tag type="blue">
                      <FormattedMessage id="patient.label.name" /> :
                    </Tag>
                    {immunohistochemistrySampleInfo.lastName}{" "}
                    {immunohistochemistrySampleInfo.firstName}
                  </div>
                  <div className="patient-dob">
                    {" "}
                    <Tag type="blue">
                      {" "}
                      <FormattedMessage id="patient.label.sex" />:
                    </Tag>
                    {immunohistochemistrySampleInfo.sex === "M"
                      ? "Male"
                      : "Female"}
                    <Tag type="blue">
                      <FormattedMessage id="patient.label.age" /> :
                    </Tag>
                    {immunohistochemistrySampleInfo.age}{" "}
                  </div>
                  <div className="patient-id">
                    <Tag type="blue">
                      <FormattedMessage id="sample.label.orderdate" /> :
                    </Tag>
                    {immunohistochemistrySampleInfo.requestDate}
                  </div>
                  <div className="patient-id">
                    <Tag type="blue">
                      <FormattedMessage id="sample.label.labnumber" /> :
                    </Tag>
                    {immunohistochemistrySampleInfo.labNumber}
                  </div>
                  <div className="patient-id">
                    <Tag type="blue">
                      <FormattedMessage id="sample.label.facility" />:
                    </Tag>
                    {immunohistochemistrySampleInfo.referringFacility}{" "}
                    <Tag type="blue">
                      <FormattedMessage id="sample.label.dept" /> :
                    </Tag>{" "}
                    {immunohistochemistrySampleInfo.department}
                  </div>
                  <div className="patient-id">
                    <Tag type="blue">
                      <FormattedMessage id="sample.label.requester" />: :
                    </Tag>
                    {immunohistochemistrySampleInfo.requester}
                  </div>
                </div>
              ) : (
                <div className="patient-header2">
                  <div className="patient-name">
                    <FormattedMessage id="patient.label.nopatientid" />{" "}
                  </div>
                </div>
              )}
            </Section>
          </Section>
          <Section>
            <Section>
              <div className="patient-header2">
                <QuestionnaireResponse
                  questionnaireResponse={
                    immunohistochemistrySampleInfo.programQuestionnaireResponse
                  }
                />
              </div>
            </Section>
          </Section>
        </Column>
      </Grid>
      <Stack gap={4}>
        <Grid fullWidth={true} className="orderLegendBody">
          {notificationVisible === true ? <AlertDialog /> : ""}
          {(loading || resultsLoading) && (
            <Loading description="Loading Dasboard..." />
          )}

          <Column lg={16} md={8} sm={4}>
            <Button
              id="pathology_save"
              onClick={(e) => {
                e.preventDefault();
                save(e);
              }}
            >
               <FormattedMessage id="label.button.save" />
            </Button>
          </Column>
          <Column lg={16} md={8} sm={4}>
            <div> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div>
          </Column>
          <Column lg={4} md={2} sm={2}>
            <Select
              id="status"
              name="status"
              labelText={<FormattedMessage id="label.button.select.status" />}
              value={immunohistochemistrySampleInfo.status}
              onChange={(event) => {
                setImmunohistochemistrySampleInfo({
                  ...immunohistochemistrySampleInfo,
                  status: event.target.value,
                });
              }}
            >
              <SelectItem disabled value="placeholder" text="Status" />

              {statuses.map((status, index) => {
                return (
                  <SelectItem
                    key={index}
                    text={status.value}
                    value={status.id}
                  />
                );
              })}
            </Select>
          </Column>
          <Column lg={4} md={1} sm={2}>
            <Select
              id="assignedTechnician"
              name="assignedTechnician"
              labelText={
                <FormattedMessage id="label.button.select.technician" />
              }
              value={immunohistochemistrySampleInfo.assignedTechnicianId}
              onChange={(event) => {
                setImmunohistochemistrySampleInfo({
                  ...immunohistochemistrySampleInfo,
                  assignedTechnicianId: event.target.value,
                });
              }}
            >
              <SelectItem />
              {technicianUsers.map((user, index) => {
                return (
                  <SelectItem key={index} text={user.value} value={user.id} />
                );
              })}
            </Select>
          </Column>
          <Column lg={4} md={2} sm={2}>
            <Select
              id="assignedPathologist"
              name="assignedPathologist"
              labelText={
                <FormattedMessage id="label.button.select.pathologist" />
              }
              value={immunohistochemistrySampleInfo.assignedPathologistId}
              onChange={(e) => {
                setImmunohistochemistrySampleInfo({
                  ...immunohistochemistrySampleInfo,
                  assignedPathologistId: e.target.value,
                });
              }}
            >
              <SelectItem />
              {pathologistUsers.map((user, index) => {
                return (
                  <SelectItem key={index} text={user.value} value={user.id} />
                );
              })}
            </Select>
          </Column>
          <Column lg={16} md={8} sm={4}>
            <div> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div>
          </Column>
          <Column lg={16} md={8} sm={4}>
            <Grid fullWidth={true} className="gridBoundary">
              <Column lg={16} md={8} sm={4}>
                <h5>
                  <FormattedMessage id="sidenav.label.results" />
                </h5>
              </Column>
              <Column lg={16} md={8} sm={4}>
                <SearchResults results={results} />
              </Column>
            </Grid>
          </Column>

          <Column lg={16} md={8} sm={4}>
            <Grid fullWidth={true} className="gridBoundary">
              <Column lg={4} md={2} sm={2}>
                <Select
                  id="report"
                  name="report"
                  labelText={intl.formatMessage({ id: "immunohistochemistry.label.addreport" })}
                  onChange={(event) => {
                    setImmunohistochemistrySampleInfo({
                      ...immunohistochemistrySampleInfo,
                      reports: [
                        ...(immunohistochemistrySampleInfo.reports || []),
                        { id: "", reportType: event.target.value },
                      ],
                    });
                  }}
                >
                  <SelectItem disabled value="ADD" text={intl.formatMessage({ id: "immunohistochemistry.label.addreport" })} />
                  {reportTypes.map((report, index) => {
                    return (
                      <SelectItem
                        key={index}
                        text={report.value}
                        value={report.id}
                      />
                    );
                  })}
                </Select>
              </Column>
              <Column lg={12} md={2} sm={2}></Column>
              <div> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div>
              <Column lg={16} md={8} sm={4}>
                <h5>
                  {" "}
                  <FormattedMessage id="immunohistochemistry.label.reports" />
                </h5>
              </Column>
              <Column lg={16} md={8} sm={4}>
                <div> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div>
              </Column>
              {immunohistochemistrySampleInfo.reports &&
                immunohistochemistrySampleInfo.reports.map((report, index) => {
                  return (
                    <>
                      <Column lg={2} md={8} sm={4}>
                        <IconButton
                          label={intl.formatMessage({ id: "label.button.remove.report" })}
                          onClick={() => {
                            var info = { ...immunohistochemistrySampleInfo };
                            info["reports"].splice(index, 1);
                            setImmunohistochemistrySampleInfo(info);
                          }}
                          kind="tertiary"
                          size="sm"
                        >
                          <Subtract size={18} />{" "}
                          <FormattedMessage id="immunohistochemistry.label.report" />
                        </IconButton>
                      </Column>

                      <Column lg={2} md={1} sm={2}>
                        <FileUploader
                          style={{ marginTop: "-30px" }}
                          buttonLabel={
                            <FormattedMessage id="label.button.uploadfile" />
                          }
                          iconDescription="file upload"
                          multiple={false}
                          accept={[
                            "image/jpeg",
                            "image/png",
                            "application/pdf",
                          ]}
                          disabled={false}
                          name=""
                          buttonKind="primary"
                          size="lg"
                          filenameStatus="edit"
                          onChange={async (e) => {
                            e.preventDefault();
                            let file = e.target.files[0];
                            var newReports = [
                              ...immunohistochemistrySampleInfo.reports,
                            ];
                            let encodedFile = await toBase64(file);
                            newReports[index].base64Image = encodedFile;
                            setImmunohistochemistrySampleInfo({
                              ...immunohistochemistrySampleInfo,
                              reports: newReports,
                            });
                          }}
                          onClick={function noRefCheck() {}}
                          onDelete={(e) => {
                            e.preventDefault();
                          }}
                        />
                      </Column>
                      <Column lg={2}>
                        {
                          reportTypes.filter(
                            (type) => type.id === report.reportType,
                          )[0]?.value
                        }
                      </Column>
                      <Column lg={2} md={1} sm={2}>
                        {immunohistochemistrySampleInfo.reports[index]
                          .image && (
                          <>
                            <Button
                              onClick={() => {
                                var win = window.open();
                                win.document.write(
                                  '<iframe src="' +
                                    report.fileType +
                                    ";base64," +
                                    report.image +
                                    '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>',
                                );
                              }}
                            >
                              <Launch />{" "}
                              <FormattedMessage id="pathology.label.view" />
                            </Button>
                          </>
                        )}
                      </Column>
                      <Column lg={3} md={2} sm={2}>
                      <Button
                        onClick={(e) => {
                          window.open(
                            config.serverBaseUrl +
                              "/rest/ReportPrint?report=PatientImmunoChemistryReport&programSampleId=" +
                              immunohistochemistrySampleId,
                            "_blank",
                          );
                        }}
                      >
                        {" "}
                        <FormattedMessage id="button.label.genarateReport" />
                      </Button>
                    </Column>
                    <Column lg={5} md={2} sm={2}/>
                      <Column lg={16} md={8} sm={4}>
                        <div> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div>
                      </Column>
                    </>
                  );
                })}
            </Grid>
          </Column>

          {immunohistochemistrySampleInfo.reffered && (
            <>
              <Column lg={16} md={8} sm={4}>
                <Grid fullWidth={true} className="gridBoundary">
                  <Column lg={16} md={8} sm={4}>
                    <h5>
                      {" "}
                      <FormattedMessage id="pathology.label.blocks" />
                    </h5>
                  </Column>
                  <div> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div>
                  <Column lg={16} md={8} sm={4} />
                  {immunohistochemistrySampleInfo.blocks &&
                    immunohistochemistrySampleInfo.blocks.map(
                      (block, index) => {
                        return (
                          <>
                            <Column lg={2} md={2} sm={1} key={index}>
                              <TextInput
                                id="blockNumber"
                                labelText={intl.formatMessage({ id: "pathology.label.block.number" })}
                                hideLabel={true}
                                placeholder={intl.formatMessage({ id: "pathology.label.block.number" })}
                                value={block.blockNumber}
                                disabled={true}
                              />
                            </Column>
                            <Column lg={2} md={2} sm={1}>
                              <TextInput
                                id="location"
                                labelText={intl.formatMessage({ id: "pathology.label.location" })}
                                hideLabel={true}
                                placeholder={intl.formatMessage({ id: "pathology.label.location" })}
                                value={block.location}
                                disabled={true}
                              />
                            </Column>
                            <Column lg={2} md={2} sm={2}>
                              <Button
                                onClick={() => {
                                  window.open(
                                    config.serverBaseUrl +
                                      "/LabelMakerServlet?labelType=block&code=" +
                                      block.blockNumber,
                                    "_blank",
                                  );
                                }}
                              >
                                {" "}
                                <FormattedMessage id="pathology.label.printlabel" />
                              </Button>
                            </Column>
                            <Column lg={10} md={2} sm={0} />
                            <Column lg={16} md={8} sm={4}>
                              <div>
                                {" "}
                                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                              </div>
                            </Column>
                          </>
                        );
                      },
                    )}
                </Grid>
              </Column>

              <Column lg={16} md={8} sm={4}>
                <Grid fullWidth={true} className="gridBoundary">
                  <Column lg={16} md={8} sm={4}>
                    <h5>
                      {" "}
                      <FormattedMessage id="pathology.label.slides" />
                    </h5>
                    <div> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div>
                  </Column>

                  <Column lg={16} md={8} sm={4} />
                  {immunohistochemistrySampleInfo.slides &&
                    immunohistochemistrySampleInfo.slides.map(
                      (slide, index) => {
                        return (
                          <>
                            <Column lg={2} md={2} sm={1} key={index}>
                              <TextInput
                                id="slideNumber"
                                labelText={intl.formatMessage({ id: "pathology.label.slide.number" })}
                                hideLabel={true}
                                disabled={true}
                                placeholder={intl.formatMessage({ id: "pathology.label.slide.number" })}
                                value={slide.slideNumber}
                              />
                            </Column>
                            <Column lg={2} md={2} sm={1}>
                              <TextInput
                                id="location"
                                labelText={intl.formatMessage({ id: "pathology.label.location" })}
                                hideLabel={true}
                                placeholder={intl.formatMessage({ id: "pathology.label.location" })}
                                value={slide.location}
                                disabled={true}
                              />
                            </Column>
                            <Column lg={2} md={1} sm={2}>
                              {immunohistochemistrySampleInfo.slides[index]
                                .image && (
                                <>
                                  <Button
                                    onClick={() => {
                                      var win = window.open();
                                      win.document.write(
                                        '<iframe src="' +
                                          slide.fileType +
                                          ";base64," +
                                          slide.image +
                                          '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>',
                                      );
                                    }}
                                  >
                                    <Launch />{" "}
                                    <FormattedMessage id="pathology.label.view" />
                                  </Button>
                                </>
                              )}
                            </Column>
                            <Column lg={2} md={1} sm={2}>
                              <Button
                                onClick={() => {
                                  window.open(
                                    config.serverBaseUrl +
                                      "/LabelMakerServlet?labelType=slide&code=" +
                                      slide.slideNumber,
                                    "_blank",
                                  );
                                }}
                              >
                                {" "}
                                <FormattedMessage id="pathology.label.printlabel" />
                              </Button>
                            </Column>
                            <Column lg={8} md={1} sm={2} />
                            <Column lg={16} md={8} sm={4}>
                              <div>
                                {" "}
                                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                              </div>
                            </Column>
                          </>
                        );
                      },
                    )}
                </Grid>
              </Column>

              <Column lg={16} md={8} sm={4}>
                <Grid fullWidth={true} className="gridBoundary">
                  {hasRole(userSessionDetails, "Pathologist") && (
                    <>
                      <Column lg={2} md={4} sm={2}>
                        <h6>
                          <FormattedMessage id="pathology.label.techniques" />:{" "}
                        </h6>
                      </Column>
                      <Column lg={14} md={4} sm={2}>
                        {immunohistochemistrySampleInfo.techniques &&
                          immunohistochemistrySampleInfo.techniques.map(
                            (technique, index) => (
                              <>
                                <Tag key={index}>{technique.value} </Tag>
                              </>
                            ),
                          )}
                      </Column>
                      <Column lg={2} md={4} sm={2}>
                        <h6>
                          <FormattedMessage id="pathology.label.request" />:{" "}
                        </h6>
                      </Column>
                      <Column lg={14} md={4} sm={2}>
                        {immunohistochemistrySampleInfo.requests &&
                          immunohistochemistrySampleInfo.requests.map(
                            (technique, index) => (
                              <>
                                <Tag key={index}> {technique.value} </Tag>
                              </>
                            ),
                          )}
                      </Column>
                      <Column lg={2} md={8} sm={4}>
                        <h6>
                          {" "}
                          <FormattedMessage id="pathology.label.grossexam" /> :
                        </h6>
                      </Column>
                      <Column lg={14} md={8} sm={4}>
                        <Tag>{immunohistochemistrySampleInfo.grossExam} </Tag>
                      </Column>
                      <Column lg={2} md={8} sm={4}>
                        <h6>
                          {" "}
                          <FormattedMessage id="pathology.label.microexam" /> :
                        </h6>
                      </Column>
                      <Column lg={14} md={8} sm={4}>
                        <Tag>
                          {immunohistochemistrySampleInfo.microscopyExam}{" "}
                        </Tag>
                      </Column>
                      <Column lg={2} md={4} sm={2}>
                        <h6>
                          {" "}
                          <FormattedMessage id="pathology.label.conclusion" /> :
                        </h6>
                      </Column>
                      <Column lg={14} md={4} sm={2}>
                        {immunohistochemistrySampleInfo.conclusions &&
                          immunohistochemistrySampleInfo.conclusions.map(
                            (conclusion, index) => (
                              <>
                                <Tag key={index}> {conclusion.value} </Tag>
                              </>
                            ),
                          )}
                      </Column>
                      <Column lg={2} md={8} sm={4}>
                        <h6>
                          {" "}
                          <FormattedMessage id="pathology.label.textconclusion" />{" "}
                          :
                        </h6>
                      </Column>
                      <Column lg={14} md={8} sm={4}>
                        <Tag>
                          {immunohistochemistrySampleInfo.conclusionText}
                        </Tag>
                      </Column>
                    </>
                  )}
                </Grid>
              </Column>
            </>
          )}

          <Column lg={16}>
            <Checkbox
              labelText={<FormattedMessage id="pathology.label.release" />}
              id="release"
              onChange={() => {
                setImmunohistochemistrySampleInfo({
                  ...immunohistochemistrySampleInfo,
                  release: !immunohistochemistrySampleInfo.release,
                });
              }}
            />
          </Column>

          <Column>
            <Button
              id="pathology_save2"
              onClick={(e) => {
                e.preventDefault();
                save(e);
              }}
            >
               <FormattedMessage id="label.button.save" />
            </Button>
          </Column>
        </Grid>
      </Stack>
    </>
  );
}

export default ImmunohistochemistryCaseView;
