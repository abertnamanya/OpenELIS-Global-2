package org.openelisglobal.testreflex.action.bean;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name = "reflex_rule_condition")
public class ReflexRuleCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "reflex_rule_condition_generator")
    @SequenceGenerator(name = "reflex_rule_condition_generator", sequenceName = "reflex_rule_condition_seq", allocationSize = 1)
    @Column(name = "id")
    private Integer id;

    @Column(name = "sample_id")
    private String sampleId;

    @Column(name = "test_name")
    private String testName;

    @Column(name = "test_id")
    private String testId;

    @Column(name = "relation")
    private String relation;

    @Column(name = "value")
    private String value ;

    public Integer getId() {
        return id;
    }
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getSampleId() {
        return sampleId;
    }
    public void setSampleId(String sampleId) {
        this.sampleId = sampleId;
    }
    public String getTestName() {
        return testName;
    }
    public void setTestName(String testName) {
        this.testName = testName;
    }
    public String getTestId() {
        return testId;
    }
    public void setTestId(String testId) {
        this.testId = testId;
    }
    public String getRelation() {
        return relation;
    }
    public void setRelation(String relation) {
        this.relation = relation;
    }
    public String getValue() {
        return value;
    }
    public void setValue(String value) {
        this.value = value;
    }
}
