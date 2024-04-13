package org.openelisglobal.dictionary.rest.controller;

import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.Assert.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import org.junit.Before;
import org.junit.Test;
import org.openelisglobal.BaseWebContextSensitiveTest;
import org.openelisglobal.dictionary.daoimpl.DictionaryDAOImpl;
import org.openelisglobal.dictionary.service.DictionaryService;
import org.openelisglobal.dictionary.valueholder.Dictionary;
import org.openelisglobal.dictionarycategory.valueholder.DictionaryCategory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Arrays;
import java.util.List;

public class DictionaryMenuRestControllerTest extends BaseWebContextSensitiveTest {

    @Autowired
    DictionaryService dictionaryService;

    @Before
    @Override
    public void setUp() {
        super.setUp();
    }

    @Test
    public void getDictionaryMenuList_shouldReturnDictionaryMenu() throws Exception {
        MvcResult mvcResult = super.mockMvc.perform(
                get("/rest/get-dictionary-menu")
                .accept(MediaType.APPLICATION_JSON_VALUE)
                .contentType(MediaType.APPLICATION_JSON_VALUE)).andReturn();

        int status = mvcResult.getResponse().getStatus();
        assertEquals(200, status);
        String content = mvcResult.getResponse().getContentAsString();
        List<DictionaryDAOImpl.DictionaryMenu> menuList = Arrays.asList(super.mapFromJson(content, DictionaryDAOImpl.DictionaryMenu[].class));
        assertThat(menuList, notNullValue());
    }

    @Test
    public void fetchDictionaryCategoryDescriptions_shouldFetchDictionaryDescriptions() throws Exception {
        MvcResult mvcResult = super.mockMvc.perform(
                get("/rest/dictionary-categories/descriptions")
                        .accept(MediaType.APPLICATION_JSON_VALUE)
                        .contentType(MediaType.APPLICATION_JSON_VALUE)).andReturn();

        int status = mvcResult.getResponse().getStatus();
        assertEquals(200, status);
        String content = mvcResult.getResponse().getContentAsString();
        List<DictionaryDAOImpl.DictionaryDescription> menuList = Arrays.asList(super.mapFromJson(content, DictionaryDAOImpl.DictionaryDescription[].class));
        assertThat(menuList, notNullValue());
    }

    @Test
    public void createDictionary_shouldSuccessfullyCreateDictionary() throws Exception {
        Dictionary dictionary = createDictionaryObject();
        String toJson = super.mapToJson(dictionary);

        MvcResult mvcResult = super.mockMvc.perform(post("/rest/create-dictionary")
                .accept(MediaType.APPLICATION_JSON_VALUE)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(toJson)).andReturn();

        int status = mvcResult.getResponse().getStatus();
        assertEquals(201, status);
        String content = mvcResult.getResponse().getContentAsString();
        assertEquals(content, "Dictionary created successfully");
    }

    private Dictionary createDictionaryObject() {
        DictionaryCategory category = new DictionaryCategory();
        category.setId("10234");
        category.setLocalAbbreviation("HEC");
        category.setCategoryName("category for test");
        category.setDescription("Description for Testing");
        dictionaryService.saveDictionaryCategory(category);

        Dictionary dictionary = new Dictionary();
        dictionary.setId("99566");
        dictionary.setSortOrder(124);
        dictionary.setDictionaryCategory(category);
        dictionary.setDictEntry("entry for test");
        dictionary.setIsActive("N");
        dictionary.setLocalAbbreviation("HEC");
        return dictionary;
    }
}
